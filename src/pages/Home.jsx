import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listTools } from '@/api/toolsClient';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ToolGrid from '@/components/tools/ToolGrid';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import PricingFilter from '@/components/tools/PricingFilter';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { removeVietnameseTones } from '@/lib/utils';
import { slugToPricing, pricingToSlug, categoryToSlug } from '@/lib/tool-categories';

export default function Home() {
  const { pricing: pricingParam } = useParams();
  const navigate = useNavigate();

  const activeCategory = 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const pricingFilter = slugToPricing(pricingParam);

  const { data: tools = [], isLoading, error } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
  });

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    tools.forEach(t => {
      t.categories?.forEach(category => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });
    return counts;
  }, [tools]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    let result = tools;
    if (pricingFilter) result = result.filter(t => t.pricing === pricingFilter);
    if (searchQuery.trim()) {
      const q = removeVietnameseTones(searchQuery);
      result = result.filter(t =>
        removeVietnameseTones(t.name).includes(q)
      );
    }
    return result;
  }, [tools, searchQuery, pricingFilter]);

  const handlePricingChange = (newPricing) => {
    if (!newPricing) {
      navigate('/');
    } else {
      const slug = pricingToSlug(newPricing);
      navigate(`/pricing/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CommandSidebar
        activeCategory={activeCategory}
        onCategoryChange={(nextCategory) => {
          if (nextCategory === 'all') {
            const pSlug = pricingParam ? `pricing/${pricingParam}` : '';
            navigate(`/${pSlug}`);
          } else {
            const catSlug = categoryToSlug(nextCategory);
            const pSlug = pricingParam ? `/${pricingParam}` : '';
            navigate(`/category/${catSlug}${pSlug}`);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onSelectTool={setSelectedTool}
      />

      {/* Main Content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DataTicker totalTools={tools.length} categories={categoryCounts} />
          
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Tất cả công cụ
                </h2>
                <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
                  {filteredTools.length} RESULTS FOUND
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PricingFilter active={pricingFilter} onChange={handlePricingChange} />
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 lg:p-5">
          {error ? (
            <div className="rounded border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-mono text-destructive tracking-wider">SUPABASE LOAD ERROR</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          ) : (
            <ToolGrid
              tools={filteredTools}
              isLoading={isLoading}
              onSelectTool={setSelectedTool}
              activePricingFilter={pricingFilter}
            />
          )}
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-border px-4 lg:px-5 py-2 bg-secondary/20">
          <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">
            {'>'} neural-index --status // all systems operational // last_sync: {new Date().toISOString().split('T')[0]}
          </p>
        </div>
      </div>

      <ToolDetailDrawer
        tool={selectedTool}
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  );
}
