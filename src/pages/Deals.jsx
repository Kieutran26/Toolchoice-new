import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listTools, getInitialTools } from '@/api/toolsClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Menu, Percent, Copy, Check, ExternalLink, Gift, CheckCircle2, Tag, X, BookOpen, ShieldAlert } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SiteFooter from '@/components/layout/SiteFooter';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import SEOHead, { SITE_ORIGIN } from '@/components/SEOHead';
import { cn } from '@/lib/utils';
import { categoryToSlug } from '@/lib/tool-categories';
import { getToolSlug, getPricingLabelVi } from '@/lib/tool-content';

export default function Deals() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: tools = getInitialTools(), error } = useQuery({
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

  const deals = useMemo(
    () => tools.filter((t) => t.has_promotion || t.referral_offer || t.promotion_code),
    [tools]
  );

  const topFreemiumTools = useMemo(
    () => tools.filter((t) => t.pricing === 'freemium' && !t.has_promotion && !t.referral_offer).slice(0, 6),
    [tools]
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Deals, Mã Giảm Giá & Ưu Đãi Công Cụ Phần Mềm, AI | Toolchoice',
    description:
      'Tổng hợp các chương trình khuyến mãi, mã giảm giá (Promo Codes), ưu đãi giới thiệu và hướng dẫn tối ưu chi phí đăng ký phần mềm SaaS, công cụ AI trên Toolchoice.',
    url: `${SITE_ORIGIN}/deals`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Deals, Mã Giảm Giá & Ưu Đãi Công Cụ AI, Phần Mềm | Toolchoice"
        description="Tổng hợp mã giảm giá (Promo Codes), ưu đãi dùng thử mở rộng (Referral Offers) và kinh nghiệm tối ưu chi phí thuê bao phần mềm SaaS, công cụ AI trên Toolchoice."
        canonicalPath="/deals"
        jsonLd={jsonLd}
      />

      <CommandSidebar
        activeCategory="deals"
        onCategoryChange={(nextCategory) => {
          if (nextCategory === 'all') {
            navigate('/');
          } else {
            const catSlug = categoryToSlug(nextCategory);
            navigate(`/category/${catSlug}`);
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
        onSelectTool={setSelectedTool}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DataTicker totalTools={tools.length} categories={categoryCounts} />

          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                aria-label="Mở menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono tracking-wider">TRANG CHỦ</span>
              </Link>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2.5">
                <Percent className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <h1 className="text-sm font-semibold text-foreground leading-none">Deals &amp; Ưu đãi Phần mềm</h1>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-1">
                    {deals.length} ƯU ĐÃI &amp; CHƯƠNG TRÌNH GIỚI THIỆU
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex-1 p-4 lg:p-5 space-y-8">
          {/* Editorial Intro on SaaS Deals */}
          <section className="rounded-xl border border-amber-400/30 bg-card p-5 sm:p-6 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-300 bg-amber-400/15 px-2.5 py-1 rounded">
              TỐI ƯU NGÂN SÁCH PHẦN MỀM
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              Danh sách Mã giảm giá, Ưu đãi giới thiệu &amp; Hướng dẫn săn Deal phần mềm an toàn
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Trang này tập hợp các mã khuyến mãi (Promo Codes) và ưu đãi tặng thêm lượt sử dụng (Referral Offers) từ các nhà phát triển công cụ trong danh mục Toolchoice. Trước khi áp dụng mã thanh toán, bạn nên đọc kỹ bài đánh giá ưu nhược điểm của từng công cụ và thử nghiệm trước trên gói miễn phí.
            </p>
          </section>

          {/* Deals Grid */}
          <section className="space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              1. Các công cụ đang có Mã ưu đãi &amp; Quà tặng đăng ký ({deals.length})
            </h2>

            {error && deals.length === 0 ? (
              <div className="rounded border border-destructive/30 bg-destructive/5 p-4">
                <p className="text-xs font-mono text-destructive tracking-wider">SUPABASE LOAD ERROR</p>
                <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {deals.map((tool) => (
                  <DealCard key={tool.id} tool={tool} onSelect={setSelectedTool} />
                ))}
              </div>
            )}
          </section>

          {/* Guide on Evaluating SaaS Promotions */}
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              2. Bốn nguyên tắc cần kiểm tra trước khi mua gói phần mềm khuyến mãi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <div className="p-4 rounded-lg border border-border bg-secondary/15 space-y-1.5">
                <h3 className="font-semibold text-foreground">Kiểm tra điều kiện gia hạn tự động (Auto-Renewal)</h3>
                <p>
                  Nhiều mã giảm giá áp dụng cho tháng đầu tiên hoặc năm đầu tiên. Hãy kiểm tra mức giá sẽ áp dụng ở chu kỳ tiếp theo và đánh dấu lịch nhắc trước ngày gia hạn 3 ngày.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/15 space-y-1.5">
                <h3 className="font-semibold text-foreground">Đối chiếu giới hạn Credit của gói ưu đãi</h3>
                <p>
                  Với các công cụ AI tạo ảnh, video hoặc âm thanh, hãy xem kỹ số lượng credits tặng kèm có cộng dồn sang tháng sau (rollover) hay sẽ hết hạn vào cuối chu kỳ.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/15 space-y-1.5">
                <h3 className="font-semibold text-foreground">Đọc kỹ chính sách hoàn tiền (Refund Policy)</h3>
                <p>
                  Các nhà cung cấp phần mềm uy tín thường có chính sách hoàn tiền trong 7–14 ngày nếu sản phẩm không hoạt động đúng như cam kết kỹ thuật.
                </p>
              </div>
              <div className="p-4 rounded-lg border border-border bg-secondary/15 space-y-1.5">
                <h3 className="font-semibold text-foreground">Thử nghiệm khả năng xuất dữ liệu trước khi nâng cấp</h3>
                <p>
                  Đừng nâng cấp lên gói trả phí dài hạn nếu bạn chưa thử hoàn thành ít nhất một tác vụ thực tế từ đầu đến cuối trên công cụ đó. Xem thêm tại{' '}
                  <Link to="/blog/chien-luoc-toi-uu-chi-phi-phan-mem-saas" className="text-primary underline">
                    Chiến lược tối ưu chi phí phần mềm SaaS
                  </Link>.
                </p>
              </div>
            </div>
          </section>

          {/* Freemium / Free Trial Spotlight */}
          {topFreemiumTools.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  3. Gợi ý các công cụ có gói Dùng thử miễn phí (Free Trial / Freemium) đáng chú ý
                </h2>
                <Link to="/pricing/free-trial" className="text-xs font-mono text-primary hover:underline">
                  Xem toàn bộ công cụ có Free Trial →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {topFreemiumTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="rounded-lg border border-border bg-card p-4 space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <Link
                          to={`/tool/${getToolSlug(tool)}`}
                          className="text-sm font-semibold text-foreground hover:text-primary hover:underline truncate"
                        >
                          {tool.name}
                        </Link>
                        <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 shrink-0">
                          {getPricingLabelVi(tool.pricing)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {tool.short_description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-[11px] font-mono">
                      <Link to={`/tool/${getToolSlug(tool)}`} className="text-primary hover:underline">
                        Đọc đánh giá chi tiết →
                      </Link>
                      {tool.website_url && (
                        <a
                          href={tool.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                        >
                          Website <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

function DealCard({ tool, onSelect }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const toolSlug = getToolSlug(tool);

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    if (!tool.promotion_code) return;
    try {
      await navigator.clipboard.writeText(tool.promotion_code);
      setCopied(true);
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Đã sao chép mã ưu đãi
          </span>
        ),
        description: (
          <span className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/15 border border-amber-400/30 font-mono text-xs font-bold tracking-wider text-amber-600 dark:text-amber-300">
            <Tag className="w-3 h-3" />
            {tool.promotion_code}
          </span>
        ),
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: (
          <span className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Không thể sao chép mã
          </span>
        ),
        description: 'Trình duyệt chặn quyền truy cập clipboard. Vui lòng sao chép thủ công.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      className="rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-4 space-y-3 cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/[0.08] transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="relative w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
            {tool.logo_url ? (
              <img src={tool.logo_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain bg-secondary" onError={(e) => e.currentTarget.remove()} />
            ) : (
              <span className="text-base font-bold font-mono text-primary">{tool.name?.[0]}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">
              <Link
                to={`/tool/${toolSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="hover:text-primary hover:underline"
              >
                {tool.name}
              </Link>
            </h3>
            <p className="text-[11px] text-amber-700 dark:text-amber-300 font-medium mt-0.5">
              {tool.promotion_description || tool.referral_offer || 'Ưu đãi đặc biệt từ nhà cung cấp'}
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mt-1">
              {tool.short_description}
            </p>
          </div>
        </div>

        {tool.promotion_code && (
          <button
            onClick={handleCopyCode}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-dashed border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300 transition-colors hover:bg-amber-400/15"
          >
            <span className="text-xs font-mono font-bold tracking-wider truncate">MÃ: {tool.promotion_code}</span>
            {copied ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-amber-400/20">
        <Link
          to={`/tool/${toolSlug}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-primary hover:underline"
        >
          <BookOpen className="w-3 h-3" />
          ĐỌC ĐÁNH GIÁ
        </Link>
        {tool.website_url && (
          <a
            href={tool.website_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-muted-foreground hover:text-primary transition-colors"
            )}
          >
            <ExternalLink className="w-3 h-3" />
            TRUY CẬP WEBSITE
          </a>
        )}
      </div>
    </div>
  );
}
