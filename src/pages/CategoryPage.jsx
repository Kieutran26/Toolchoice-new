import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listTools } from '@/api/toolsClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Menu } from 'lucide-react';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ToolGrid from '@/components/tools/ToolGrid';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import PricingFilter from '@/components/tools/PricingFilter';
import ThemeToggle from '@/components/layout/ThemeToggle';
import { slugToCategory, slugToPricing, pricingToSlug, categoryToSlug, getCategoryLabel, getCategoryIcon } from '@/lib/tool-categories';
import { removeVietnameseTones } from '@/lib/utils';

export default function CategoryPage() {
  const { category: categoryParam, pricing: pricingParam } = useParams();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: tools = [], isLoading, error } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
  });

  const categoryCounts = useMemo(() => {
    const counts = {};
    tools.forEach(t => {
      t.categories?.forEach(categoryName => {
        counts[categoryName] = (counts[categoryName] || 0) + 1;
      });
    });
    return counts;
  }, [tools]);

  const allAvailableCategories = useMemo(() => {
    return Object.keys(categoryCounts);
  }, [categoryCounts]);

  const category = useMemo(() => {
    return slugToCategory(categoryParam, allAvailableCategories);
  }, [categoryParam, allAvailableCategories]);

  const pricingFilter = slugToPricing(pricingParam);

  const filteredTools = useMemo(() => {
    let result = tools.filter(t => t.categories?.includes(category));
    if (pricingFilter) result = result.filter(t => t.pricing === pricingFilter);
    if (searchQuery.trim()) {
      const q = removeVietnameseTones(searchQuery);
      result = result.filter(t => removeVietnameseTones(t.name).includes(q));
    }
    return result;
  }, [tools, category, pricingFilter, searchQuery]);

  const label = getCategoryLabel(category);
  const Icon = getCategoryIcon(category);

  const handlePricingChange = (newPricing) => {
    if (!newPricing) {
      navigate(`/category/${categoryParam}`);
    } else {
      const slug = pricingToSlug(newPricing);
      navigate(`/category/${categoryParam}/${slug}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CommandSidebar
        activeCategory={category}
        onCategoryChange={(nextCategory) => {
          if (nextCategory === 'all') {
            const pSlug = pricingParam ? `pricing/${pricingParam}` : '';
            navigate(`/${pSlug}`);
          } else {
            const nextCatSlug = categoryToSlug(nextCategory);
            const pSlug = pricingParam ? `/${pricingParam}` : '';
            navigate(`/category/${nextCatSlug}${pSlug}`);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onSelectTool={setSelectedTool}
      />

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
              <Link
                to={pricingParam ? `/pricing/${pricingParam}` : "/"}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono tracking-wider">BACK</span>
              </Link>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2.5">
                {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-none">{label}</h2>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-1">
                    {filteredTools.length} RESULTS FOUND
                  </p>
                </div>
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
            {'>'} neural-index --category={category} // {filteredTools.length} tools loaded
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
