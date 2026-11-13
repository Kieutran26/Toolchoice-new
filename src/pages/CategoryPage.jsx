import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { listTools, getInitialTools } from '@/api/toolsClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Menu, Search } from 'lucide-react';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ToolGrid from '@/components/tools/ToolGrid';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import PricingFilter from '@/components/tools/PricingFilter';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SiteFooter from '@/components/layout/SiteFooter';
import SEOHead, { SITE_ORIGIN } from '@/components/SEOHead';
import { slugToCategory, slugToPricing, pricingToSlug, categoryToSlug, getCategoryLabel, getCategoryIcon } from '@/lib/tool-categories';
import { getPricingLabelVi } from '@/lib/tool-content';
import { getCategoryGuide } from '@/data/category-guides';
import { removeVietnameseTones } from '@/lib/utils';

export default function CategoryPage() {
  const { category: categoryParam, pricing: pricingParam } = useParams();
  const navigate = useNavigate();
  const [selectedTool, setSelectedTool] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: tools = getInitialTools(), isLoading, error } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
    initialData: getInitialTools,
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

  const categoryTools = useMemo(() => {
    return tools.filter(t => t.categories?.includes(category));
  }, [tools, category]);

  const filteredTools = useMemo(() => {
    let result = searchQuery.trim() ? tools : categoryTools;
    if (pricingFilter) result = result.filter(t => t.pricing === pricingFilter);
    if (searchQuery.trim()) {
      const q = removeVietnameseTones(searchQuery);
      result = result.filter(t =>
        removeVietnameseTones(t.name).includes(q) ||
        removeVietnameseTones(t.short_description || '').includes(q)
      );
    }
    return result;
  }, [tools, categoryTools, pricingFilter, searchQuery]);

  const label = searchQuery.trim() ? `Tìm kiếm: "${searchQuery}"` : getCategoryLabel(category);
  const Icon = searchQuery.trim() ? Search : getCategoryIcon(category);
  const guide = useMemo(() => getCategoryGuide(category), [category]);

  const handlePricingChange = (newPricing) => {
    if (!newPricing) {
      navigate(`/category/${categoryParam}`);
    } else {
      const slug = pricingToSlug(newPricing);
      navigate(`/category/${categoryParam}/${slug}`);
    }
  };

  const catSlug = categoryToSlug(category);
  const canonicalPath = pricingFilter
    ? `/category/${catSlug}/${pricingToSlug(pricingFilter)}`
    : `/category/${catSlug}`;

  const pageTitle = pricingFilter
    ? `Top công cụ ${label} (${getPricingLabelVi(pricingFilter)}) — Đánh giá & Hướng dẫn | Toolchoice`
    : `${guide.title} — Đánh giá, Ưu nhược điểm & So sánh | Toolchoice`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: guide.title,
    description: guide.subtitle,
    url: `${SITE_ORIGIN}${canonicalPath}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={pageTitle}
        description={guide.subtitle}
        canonicalPath={canonicalPath}
        robots={filteredTools.length === 0 ? 'noindex, follow' : 'index, follow'}
        jsonLd={jsonLd}
      />

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
                aria-label="Mở menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link
                to={pricingParam ? `/pricing/${pricingParam}` : "/"}
                className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono tracking-wider">TRANG CHỦ</span>
              </Link>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2.5">
                {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
                <div>
                  <h1 className="text-sm font-semibold text-foreground leading-none">{label}</h1>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-1">
                    {filteredTools.length} CÔNG CỤ TRONG DANH MỤC
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

        {/* Category Editorial Guide (hidden) */}
        {/* <section aria-label={`Hướng dẫn chọn công cụ ${label}`} className="px-4 lg:px-5 pt-5">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                HƯỚNG DẪN &amp; TIÊU CHÍ CHỌN CÔNG CỤ {label.toUpperCase()}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-foreground">
                {guide.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {guide.intro}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {guide.criteria.map((criterion, idx) => (
                <div key={idx} className="p-3.5 rounded-lg border border-border bg-secondary/15 text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{criterion}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2.5 text-xs text-foreground/90">
              <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p>
                <strong>Kinh nghiệm thực tế:</strong> {guide.workflowTip}
              </p>
            </div>
          </div>
        </section> */}

        {/* Grid */}
        <div className="flex-1 p-4 lg:p-5 space-y-6">
          {error && tools.length === 0 ? (
            <div className="rounded border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-mono text-destructive tracking-wider">SUPABASE LOAD ERROR</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          ) : filteredTools.length === 0 && categoryTools.length > 0 ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-secondary/20 p-5 text-center space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Hiện chưa có công cụ nào khớp với bộ lọc giá "{getPricingLabelVi(pricingFilter)}" trong danh mục {label}.
                </p>
                <p className="text-xs text-muted-foreground">
                  Dưới đây là toàn bộ {categoryTools.length} công cụ hiện có trong danh mục <strong>{label}</strong> để bạn tham khảo và so sánh:
                </p>
                <button
                  onClick={() => handlePricingChange(null)}
                  className="mt-2 inline-flex items-center px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-mono font-bold"
                >
                  XÓA BỘ LỌC GIÁ
                </button>
              </div>
              <ToolGrid
                tools={categoryTools}
                isLoading={false}
                onSelectTool={setSelectedTool}
                activePricingFilter={null}
              />
            </div>
          ) : (
            <ToolGrid
              tools={filteredTools}
              isLoading={isLoading && tools.length === 0}
              onSelectTool={setSelectedTool}
              activePricingFilter={pricingFilter}
            />
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
