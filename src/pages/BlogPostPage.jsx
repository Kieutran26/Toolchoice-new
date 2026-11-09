import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  BookOpen,
  Menu,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { listTools, getInitialTools } from '@/api/toolsClient';
import { categoryToSlug, slugToCategory } from '@/lib/tool-categories';
import { getToolSlug, getPricingLabelVi } from '@/lib/tool-content';
import { BLOG_POSTS, findBlogPostBySlug } from '@/data/blog-posts';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ThemeToggle from '@/components/layout/ThemeToggle';
import SiteFooter from '@/components/layout/SiteFooter';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import SEOHead, { SITE_ORIGIN } from '@/components/SEOHead';
import { Button } from '@/components/ui/button';

export default function BlogPostPage() {
  const { slug } = useParams();
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

  const post = useMemo(() => findBlogPostBySlug(slug), [slug]);

  const relatedTools = useMemo(() => {
    if (!post) return [];
    const targetCategory = slugToCategory(post.relatedCategory, Object.keys(categoryCounts));
    return tools
      .filter((t) => t.category === targetCategory || t.categories?.includes(targetCategory))
      .slice(0, 6);
  }, [post, tools, categoryCounts]);

  const otherPosts = useMemo(() => {
    return BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3);
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <SEOHead
          title="Không tìm thấy bài viết | Toolchoice"
          description="Bài viết bạn tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn mới."
          canonicalPath={`/blog/${slug || ''}`}
          robots="noindex, nofollow"
        />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-foreground">Không tìm thấy bài viết</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Bài viết bạn đang tìm kiếm không tồn tại. Hãy quay lại trang danh sách Blog &amp; Cẩm nang để đọc các hướng dẫn mới nhất.
          </p>
          <Link to="/blog" className="mt-6">
            <Button className="custom-primary-button font-mono text-xs">XEM TẤT CẢ BÀI VIẾT</Button>
          </Link>
        </div>
        <SiteFooter />
      </div>
    );
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    author: {
      '@type': 'Organization',
      name: 'Ban biên tập Toolchoice',
      url: SITE_ORIGIN,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Toolchoice',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/logo.png`,
      },
    },
    mainEntityOfPage: `${SITE_ORIGIN}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={post.title}
        description={post.excerpt}
        canonicalPath={`/blog/${post.slug}`}
        ogType="article"
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
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
                aria-label="Mở menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                <Link to="/blog" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Blog &amp; Cẩm nang</span>
                </Link>
                <ChevronRight className="w-3 h-3 shrink-0" />
                <span className="text-foreground font-medium truncate">{post.title}</span>
              </nav>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <article className="flex-1 max-w-4xl w-full mx-auto px-4 lg:px-6 py-6 sm:py-8 space-y-8">
          {/* Header */}
          <header className="space-y-4 border-b border-border pb-6">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
              <span className="px-2.5 py-0.5 rounded bg-primary/10 text-primary font-semibold uppercase tracking-wider">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
              <span>Ngày đăng: {post.publishedAt}</span>
              <span>Biên tập: Toolchoice Team</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {post.excerpt}
            </p>
          </header>

          {/* Key Takeaways Box */}
          <section className="rounded-xl border border-primary/25 bg-primary/[0.04] p-5 space-y-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-primary flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Tóm tắt nội dung cốt lõi (Key Takeaways)
            </h2>
            <ul className="space-y-2 text-sm text-foreground/90 leading-relaxed">
              {post.keyTakeaways.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Article Sections */}
          <div className="space-y-8">
            {post.sections.map((section, idx) => (
              <section key={idx} className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {section.heading}
                </h2>
                <div className="space-y-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {section.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx}>{p}</p>
                  ))}
                </div>

                {section.bullets && (
                  <ul className="space-y-2.5 pl-1 pt-1">
                    {section.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5 text-sm sm:text-base text-foreground/90 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.comparisonTable && (
                  <div className="overflow-x-auto rounded-xl border border-border my-4">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      {section.comparisonTable.caption && (
                        <caption className="p-3 text-left font-semibold text-foreground bg-secondary/30 border-b border-border">
                          {section.comparisonTable.caption}
                        </caption>
                      )}
                      <thead>
                        <tr className="bg-secondary/60 border-b border-border text-foreground font-mono text-xs">
                          {section.comparisonTable.headers.map((h, hIdx) => (
                            <th key={hIdx} className="p-3">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {section.comparisonTable.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-secondary/20">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={cIdx === 0 ? 'p-3 font-semibold text-foreground' : 'p-3 text-muted-foreground leading-relaxed'}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Related Tools from Category */}
          {relatedTools.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h2 className="text-base sm:text-lg font-bold text-foreground">
                    Các công cụ tiêu biểu liên quan đến chủ đề này
                  </h2>
                </div>
                <Link
                  to={`/category/${post.relatedCategory}`}
                  className="text-xs font-mono text-primary hover:underline"
                >
                  Xem toàn bộ danh mục →
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {relatedTools.map((tool) => (
                  <Link
                    key={tool.id}
                    to={`/tool/${getToolSlug(tool)}`}
                    className="p-3.5 rounded-lg border border-border bg-secondary/20 hover:border-primary/40 transition-colors space-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold text-foreground truncate">{tool.name}</h3>
                        <span className="text-[10px] font-mono text-primary shrink-0">
                          {getPricingLabelVi(tool.pricing)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                        {tool.short_description}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-primary pt-1">
                      Xem bài đánh giá chi tiết →
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Other Blog Posts */}
          <section className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-bold text-foreground">Đọc tiếp các cẩm nang khác</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {otherPosts.map((other) => (
                <Link
                  key={other.slug}
                  to={`/blog/${other.slug}`}
                  className="p-4 rounded-xl border border-border bg-card hover:border-primary/40 transition-all space-y-2"
                >
                  <span className="text-[10px] font-mono text-primary uppercase">{other.category}</span>
                  <h3 className="text-sm font-semibold text-foreground line-clamp-2">{other.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{other.excerpt}</p>
                </Link>
              ))}
            </div>
          </section>
        </article>

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
