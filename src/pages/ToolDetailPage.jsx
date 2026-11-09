import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  ExternalLink,
  Globe,
  Layers,
  BookOpen,
  HelpCircle,
  Compass,
  Scale,
  Gift,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { listTools, getInitialTools } from '@/api/toolsClient';
import { categoryToSlug, getCategoryLabel } from '@/lib/tool-categories';
import {
  findToolBySlug,
  getToolSlug,
  buildToolEditorialReview,
} from '@/lib/tool-content';
import { BLOG_POSTS } from '@/data/blog-posts';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SiteFooter from '@/components/layout/SiteFooter';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import SEOHead, { SITE_ORIGIN } from '@/components/SEOHead';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ToolDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerTool, setDrawerTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { data: tools = getInitialTools() } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
    initialData: getInitialTools,
  });

  const categoryCounts = useMemo(() => {
    const counts = {};
    tools.forEach((t) => {
      t.categories?.forEach((category) => {
        counts[category] = (counts[category] || 0) + 1;
      });
    });
    return counts;
  }, [tools]);

  const tool = useMemo(() => findToolBySlug(tools, slug), [tools, slug]);

  const review = useMemo(() => {
    if (!tool) return null;
    return buildToolEditorialReview(tool, tools);
  }, [tool, tools]);

  const relatedGuides = useMemo(() => {
    if (!tool) return BLOG_POSTS.slice(0, 3);
    const catSlug = categoryToSlug(tool.category);
    const matched = BLOG_POSTS.filter((p) => p.relatedCategory === catSlug);
    return matched.length >= 2 ? matched.slice(0, 3) : BLOG_POSTS.slice(0, 3);
  }, [tool]);

  if (!tool || !review) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Không tìm thấy công cụ | Toolchoice"
          description="Công cụ bạn tìm kiếm không tồn tại hoặc đã được di chuyển trên Toolchoice."
          canonicalPath={`/tool/${slug || ''}`}
          robots="noindex, nofollow"
        />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase">404 · TOOL NOT FOUND</p>
          <h1 className="text-2xl font-bold text-foreground mt-2">Không tìm thấy công cụ này</h1>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Đường dẫn công cụ bạn truy cập có thể đã thay đổi hoặc không còn trong danh mục. Hãy khám phá hàng trăm công cụ khác tại trang chủ.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Link to="/">
              <Button className="custom-primary-button font-mono text-xs">VỀ TRANG CHỦ</Button>
            </Link>
            <Link to="/blog">
              <Button variant="outline" className="font-mono text-xs">ĐỌC CẨM NANG CHỌN CÔNG CỤ</Button>
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const canonicalSlug = getToolSlug(tool);
  const categorySlug = categoryToSlug(tool.category);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    applicationCategory: review.categoriesJoined,
    operatingSystem: 'Web, Cloud',
    description: tool.full_description || tool.short_description,
    url: `${SITE_ORIGIN}/tool/${canonicalSlug}`,
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'free' ? '0' : undefined,
      priceCurrency: 'USD',
      description: review.pricingLabel,
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={`Đánh giá ${tool.name}: Tính năng, Ưu nhược điểm, Hướng dẫn & So sánh`}
        description={`Đánh giá chi tiết ${tool.name} (${review.pricingLabel}): ${tool.short_description} Phân tích ưu nhược điểm, hướng dẫn sử dụng từng bước và so sánh công cụ thay thế.`}
        canonicalPath={`/tool/${canonicalSlug}`}
        ogType="article"
        ogImage={tool.feature_image_url || `${SITE_ORIGIN}/logo.png`}
        jsonLd={jsonLd}
      />

      <CommandSidebar
        activeCategory={tool.category}
        onCategoryChange={(nextCategory) => {
          if (nextCategory === 'all') {
            navigate('/');
          } else {
            navigate(`/category/${categoryToSlug(nextCategory)}`);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) navigate('/');
        }}
        categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onSelectTool={setDrawerTool}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DataTicker totalTools={tools.length} categories={categoryCounts} />

          <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                aria-label="Mở menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Trang chủ</span>
                </Link>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <Link to={`/category/${categorySlug}`} className="hover:text-foreground transition-colors truncate">
                  {getCategoryLabel(tool.category)}
                </Link>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-foreground font-medium truncate">{tool.name}</span>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Main Article Content */}
        <article className="flex-1 max-w-5xl w-full mx-auto px-4 lg:px-6 py-6 space-y-8">
          {/* Tool Header Card */}
          <header className="rounded-xl border border-border bg-card overflow-hidden">
            {tool.feature_image_url && !imgError && (
              <div className="relative aspect-[21/9] w-full bg-secondary border-b border-border overflow-hidden">
                <img
                  src={tool.feature_image_url}
                  alt={`Giao diện công cụ ${tool.name}`}
                  loading="eager"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary border border-border flex items-center justify-center overflow-hidden shrink-0">
                    {tool.logo_url ? (
                      <img
                        src={tool.logo_url}
                        alt={tool.name}
                        className="w-full h-full object-contain"
                        onError={(e) => e.currentTarget.remove()}
                      />
                    ) : (
                      <span className="text-xl font-bold font-mono text-primary">{tool.name?.[0]}</span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                        ĐÁNH GIÁ CHI TIẾT CÔNG CỤ
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        Mô hình giá: <strong className="text-foreground">{review.pricingLabel}</strong>
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                      {tool.name} — Đánh giá tính năng, ưu nhược điểm &amp; hướng dẫn sử dụng
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {tool.short_description}
                    </p>
                  </div>
                </div>

                {tool.website_url && (
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0"
                  >
                    <Button className="custom-primary-button font-mono tracking-wider text-xs px-4 h-10 flex items-center gap-2 w-full sm:w-auto justify-center">
                      <Globe className="w-4 h-4" />
                      TRUY CẬP {tool.name.toUpperCase()}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                )}
              </div>

              {(tool.referral_offer || (tool.has_promotion && tool.promotion_description)) && (
                <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 font-medium">
                    <Gift className="w-4 h-4 shrink-0" />
                    Ưu đãi hiện có: {tool.referral_offer || tool.promotion_description}
                  </span>
                  {tool.promotion_code && (
                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-400/20 border border-amber-400/40">
                      Mã: {tool.promotion_code}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {(tool.categories?.length ? tool.categories : [tool.category]).map((cat) => (
                  <Link key={cat} to={`/category/${categoryToSlug(cat)}`}>
                    <Badge variant="outline" className="text-xs font-mono hover:border-primary/50 hover:text-primary transition-colors">
                      <Layers className="w-3 h-3 mr-1.5" />
                      {getCategoryLabel(cat)}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </header>

          {/* Section 1: Overview */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <BookOpen className="w-4 h-4" />
              <h2 className="text-lg font-bold text-foreground">
                1. Tổng quan &amp; Phân tích chuyên sâu về {tool.name}
              </h2>
            </div>
            <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              {review.overviewParagraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </section>

          {/* Section 2: Pros and Cons */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.03] p-5 space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500" />
                Ưu điểm nổi bật &amp; Tính năng chính
              </h2>
              <ul className="space-y-2.5 text-sm text-foreground/90 leading-relaxed">
                {review.prosList.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.03] p-5 space-y-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Nhược điểm &amp; Hạn chế cần lưu ý
              </h2>
              <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed">
                {review.consList.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 3: Step-by-step How-To */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Compass className="w-4 h-4" />
              <h2 className="text-lg font-bold text-foreground">
                2. Hướng dẫn sử dụng {tool.name} hiệu quả cho người mới
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Để kiểm chứng xem {tool.name} có thực sự phù hợp với nhu cầu công việc của bạn hay không, hãy áp dụng quy trình thử nghiệm 4 bước dưới đây:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {review.howToSteps.map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-secondary/20 space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{item.step}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 4: Target Audience & Use Cases */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">
              3. Ai nên sử dụng {tool.name}?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {review.useCases.map((uc, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-border bg-background space-y-1.5">
                  <h3 className="text-sm font-semibold text-foreground">{uc.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{uc.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5: Comparison with Alternatives */}
          {review.alternatives.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <Scale className="w-4 h-4" />
                  <h2 className="text-lg font-bold text-foreground">
                    4. So sánh {tool.name} với các công cụ thay thế cùng danh mục ({review.primaryCategory})
                  </h2>
                </div>
                <Link
                  to={`/category/${categorySlug}`}
                  className="text-xs font-mono text-primary hover:underline"
                >
                  Xem toàn bộ danh mục {review.primaryCategory} →
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Bảng dưới đây đặt {tool.name} cạnh các giải pháp tương đương trong nhóm <strong>{review.primaryCategory}</strong> để bạn dễ dàng đối chiếu mô hình giá và thế mạnh cốt lõi:
              </p>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border text-foreground font-mono text-xs">
                      <th className="p-3">Công cụ</th>
                      <th className="p-3">Mô hình giá</th>
                      <th className="p-3">Điểm mạnh &amp; Đặc trưng</th>
                      <th className="p-3 text-right">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr className="bg-primary/5">
                      <td className="p-3 font-semibold text-foreground">
                        {tool.name} <span className="text-[10px] font-mono text-primary ml-1">(Đang xem)</span>
                      </td>
                      <td className="p-3 font-mono text-xs">{review.pricingLabel}</td>
                      <td className="p-3 text-muted-foreground">{tool.short_description}</td>
                      <td className="p-3 text-right font-mono text-xs text-muted-foreground">—</td>
                    </tr>
                    {review.alternatives.map((alt) => (
                      <tr key={alt.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="p-3 font-medium text-foreground">
                          <Link to={`/tool/${alt.slug}`} className="hover:text-primary hover:underline">
                            {alt.name}
                          </Link>
                        </td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{alt.pricingLabel}</td>
                        <td className="p-3 text-muted-foreground">{alt.shortDescription}</td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/tool/${alt.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                          >
                            Đánh giá →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Section 6: FAQ */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <HelpCircle className="w-4 h-4" />
              <h2 className="text-lg font-bold text-foreground">
                5. Câu hỏi thường gặp (FAQ) về {tool.name}
              </h2>
            </div>
            <div className="space-y-4 divide-y divide-border">
              {review.faqs.map((faq, idx) => (
                <div key={idx} className={idx > 0 ? 'pt-4 space-y-1.5' : 'space-y-1.5'}>
                  <h3 className="text-sm sm:text-base font-semibold text-foreground">{faq.question}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 7: Related Blog Guides */}
          <section className="rounded-xl border border-border bg-secondary/15 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-foreground">
                Bài viết cẩm nang &amp; hướng dẫn liên quan
              </h2>
              <Link to="/blog" className="text-xs font-mono text-primary hover:underline">
                Tất cả bài viết →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedGuides.map((post) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-primary uppercase tracking-wider">
                      {post.category}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </div>
                  <span className="text-[11px] font-mono text-primary pt-1">Đọc bài viết →</span>
                </Link>
              ))}
            </div>
          </section>
        </article>

        <SiteFooter />
      </div>

      <ToolDetailDrawer
        tool={drawerTool}
        isOpen={!!drawerTool}
        onClose={() => setDrawerTool(null)}
      />
    </div>
  );
}
