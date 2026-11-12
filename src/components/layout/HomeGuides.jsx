import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blog-posts';

export default function HomeGuides() {
  const featured = BLOG_POSTS.slice(0, 3);
  const remaining = BLOG_POSTS.slice(3);
  return (
    <section aria-label="Cẩm nang lựa chọn công cụ" className="mt-10 border-t border-border pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <BookOpen className="w-4 h-4 text-primary" /> Cẩm nang lựa chọn công cụ
        </h2>
        <Link className="inline-flex min-h-11 items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" to="/blog">
          Tất cả bài viết <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {featured.map((post) => (
          <li key={post.slug}>
            <Link to={"/blog/" + post.slug} className="group flex h-full flex-col gap-3 rounded border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{post.category}</span>
              <h3 className="text-sm font-semibold leading-relaxed group-hover:text-primary">{post.title}</h3>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{post.excerpt}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-primary">Đọc cẩm nang <ArrowUpRight className="w-3.5 h-3.5" /></span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2 text-xs text-muted-foreground">
        <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline" href="/choosing-tools.html">Cách so sánh và thử công cụ</a>
        <details className="w-full md:w-auto md:max-w-xl">
          <summary className="min-h-11 cursor-pointer py-3 hover:text-foreground">Các cẩm nang khác ({remaining.length})</summary>
          <ul className="space-y-1 pb-3">{remaining.map((post) => <li key={post.slug}><Link className="inline-flex min-h-11 items-center py-2 hover:text-primary hover:underline" to={"/blog/" + post.slug}>{post.title}</Link></li>)}</ul>
        </details>
      </div>
    </section>
  );
}
