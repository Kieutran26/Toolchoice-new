import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listTools, getInitialTools } from '@/api/toolsClient';
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
import NewsletterSubscription from '@/components/newsletter/NewsletterSubscription';
import SiteFooter from '@/components/layout/SiteFooter';
import HomeGuides from '@/components/layout/HomeGuides';
import SEOHead from '@/components/SEOHead';

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
    initialData: getInitialTools,
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
      <SEOHead canonicalPath={pricingParam ? `/pricing/${pricingParam}` : '/'} title="Toolchoice - Danh mục công cụ và cẩm nang lựa chọn" description="Khám phá công cụ theo nhu cầu, đọc mô tả và tính năng được ghi nhận, tìm hướng dẫn lựa chọn và kiểm tra thông tin tại nhà cung cấp." />
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
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 lg:px-5 py-3 border-b border-border">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                aria-label="Mở menu" className="lg:hidden w-11 h-11 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-sm font-semibold text-foreground">
                  Tất cả công cụ
                </h1>
                <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
                  {filteredTools.length} RESULTS FOUND
                </p>
              </div>
            </div>
            <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end [&_button]:min-h-11 sm:[&_button]:min-h-0">
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
            <>
              <ToolGrid
                tools={filteredTools}
                isLoading={isLoading}
                onSelectTool={setSelectedTool}
                activePricingFilter={pricingFilter}
              />
              <HomeGuides />
              <div className="mt-10">
                <NewsletterSubscription variant="banner" source="home_footer" />
              </div>
            </>
          )}
        </div>

        <SiteFooter />
      </div>

      <ToolDetailDrawer
        tool={selectedTool}
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  );
}
