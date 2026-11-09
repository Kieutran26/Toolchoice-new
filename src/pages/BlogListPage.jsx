import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, ArrowRight, Menu, CheckCircle2 } from 'lucide-react';
import { listTools, getInitialTools } from '@/api/toolsClient';
import { categoryToSlug } from '@/lib/tool-categories';
import { BLOG_POSTS } from '@/data/blog-posts';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SiteFooter from '@/components/layout/SiteFooter';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import SEOHead, { SITE_ORIGIN } from '@/components/SEOHead';

export default function BlogListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Blog & Cẩm nang Công cụ Toolchoice',
    description:
      'Tổng hợp các bài viết hướng dẫn thực chiến, phân tích chuyên sâu và so sánh công cụ AI, thiết kế, lập trình, năng suất, marketing bằng tiếng Việt.',
    url: `${SITE_ORIGIN}/blog`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Blog & Cẩm nang Đánh giá, So sánh Công cụ AI & Phần mềm | Toolchoice"
        description="Các bài viết hướng dẫn thực chiến cách lựa chọn, kết hợp và tối ưu hóa công cụ AI, thiết kế UI/UX, lập trình, PKM và marketing cho công việc hàng ngày."
        canonicalPath="/blog"
        jsonLd={jsonLd}
      />

      <CommandSidebar
        activeCategory="blog"
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
        onSelectTool={setSelectedTool}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DataTicker totalTools={tools.length} categories={categoryCounts} />

          <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                aria-label="Mở menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-primary" />
                <div>
                  <h1 className="text-sm font-semibold text-foreground leading-none">
                    Blog &amp; Cẩm nang thực chiến
                  </h1>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-1">
                    {BLOG_POSTS.length} BÀI VIẾT CHUYÊN SÂU
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 lg:px-6 py-6 space-y-8">
          {/* Editorial Intro */}
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded">
              KIẾN THỨC &amp; PHƯƠNG PHÁP LUẬN
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Cẩm nang lựa chọn, so sánh và ứng dụng công cụ vào công việc thực tế
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
              Một danh sách công cụ chỉ thực sự phát huy giá trị khi bạn nắm được phương pháp đánh giá, cách kết hợp chúng thành quy trình liền mạch và nhận diện rõ các giới hạn về chi phí cũng như bảo mật dữ liệu. Các bài viết dưới đây được biên soạn chuyên sâu nhằm giúp bạn ra quyết định chính xác trước khi đăng ký bất kỳ phần mềm nào.
            </p>
          </section>

          {/* Articles Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.slug}
                className="rounded-xl border border-border bg-card p-5 sm:p-6 flex flex-col justify-between hover:border-primary/40 transition-all duration-200 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground font-mono">
                    <span className="text-primary font-semibold uppercase tracking-wider">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readingTime}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                    <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>

                  <div className="pt-2 space-y-1.5">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-foreground/80">
                      Điểm chính trong bài:
                    </p>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      {post.keyTakeaways.slice(0, 2).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Cập nhật: {post.publishedAt}
                  </span>
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary hover:underline"
                  >
                    ĐỌC TOÀN BỘ BÀI VIẾT
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </section>
        </main>

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
