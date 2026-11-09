import React from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '@/data/blog-posts';

export default function SiteFooter() {
  const featuredPosts = BLOG_POSTS.slice(0, 4);

  return (
    <footer className="border-t border-border bg-secondary/20 text-muted-foreground mt-12">
      <div className="px-4 lg:px-6 py-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 text-xs leading-relaxed">
        {/* Column 1: About Toolchoice */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Toolchoice" className="w-6 h-6 rounded" />
            <span className="text-sm font-bold font-mono tracking-wider text-foreground">TOOLCHOICE</span>
          </div>
          <p>
            Toolchoice là nền tảng tiếng Việt chuyên tổng hợp, đánh giá ưu nhược điểm, hướng dẫn sử dụng thực tế và so sánh các công cụ AI, thiết kế, lập trình, marketing và năng suất.
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            Mọi thông tin đánh giá nhằm mục đích tham khảo độc lập. Người dùng vui lòng kiểm tra bảng giá và điều khoản mới nhất trên website chính thức của từng nhà cung cấp.
          </p>
          <p className="font-mono text-[11px] text-foreground/80">
            Liên hệ hỗ trợ: <a href="mailto:support@toolchoice.site" className="underline hover:text-primary">support@toolchoice.site</a>
          </p>
        </div>

        {/* Column 2: Danh mục chính */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-mono font-bold tracking-wider uppercase text-foreground">
            Danh mục công cụ
          </h3>
          <ul className="grid grid-cols-2 gap-1.5">
            <li><Link to="/category/ai" className="hover:text-foreground hover:underline">Công cụ AI</Link></li>
            <li><Link to="/category/thiet-ke" className="hover:text-foreground hover:underline">Thiết kế & UI/UX</Link></li>
            <li><Link to="/category/lap-trinh" className="hover:text-foreground hover:underline">Lập trình & Dev</Link></li>
            <li><Link to="/category/nang-suat" className="hover:text-foreground hover:underline">Năng suất & PKM</Link></li>
            <li><Link to="/category/marketing" className="hover:text-foreground hover:underline">Marketing & Growth</Link></li>
            <li><Link to="/category/repo-github" className="hover:text-foreground hover:underline">Repo GitHub</Link></li>
            <li><Link to="/category/plugin-figma" className="hover:text-foreground hover:underline">Plugin Figma</Link></li>
            <li><Link to="/category/extension" className="hover:text-foreground hover:underline">Browser Extension</Link></li>
            <li><Link to="/category/video" className="hover:text-foreground hover:underline">Video & Audio</Link></li>
            <li><Link to="/category/seo-analytics" className="hover:text-foreground hover:underline">SEO & Analytics</Link></li>
            <li><Link to="/deals" className="hover:text-foreground hover:underline text-amber-600 dark:text-amber-400 font-medium">Deals & Ưu đãi</Link></li>
            <li><Link to="/blog" className="hover:text-foreground hover:underline text-primary font-medium">Blog & Cẩm nang</Link></li>
          </ul>
        </div>

        {/* Column 3: Bài viết hướng dẫn thực chiến */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-mono font-bold tracking-wider uppercase text-foreground">
            Hướng dẫn & Cẩm nang
          </h3>
          <ul className="space-y-2">
            {featuredPosts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`} className="hover:text-foreground hover:underline line-clamp-2">
                  {post.title}
                </Link>
              </li>
            ))}
            <li>
              <a href="/choosing-tools.html" className="hover:text-foreground hover:underline">
                Quy trình 5 bước chọn và thử nghiệm công cụ
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Thông tin pháp lý & Trang bắt buộc */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-mono font-bold tracking-wider uppercase text-foreground">
            Thông tin & Chính sách
          </h3>
          <ul className="space-y-1.5">
            <li><a href="/about.html" className="hover:text-foreground hover:underline">Giới thiệu về Toolchoice</a></li>
            <li><a href="/contact.html" className="hover:text-foreground hover:underline">Liên hệ & Báo lỗi thông tin</a></li>
            <li><a href="/privacy.html" className="hover:text-foreground hover:underline">Chính sách quyền riêng tư & Cookie</a></li>
            <li><a href="/terms.html" className="hover:text-foreground hover:underline">Điều khoản sử dụng dịch vụ</a></li>
            <li><a href="/choosing-tools.html" className="hover:text-foreground hover:underline">Tiêu chuẩn đánh giá công cụ</a></li>
            <li><a href="/sitemap.xml" className="hover:text-foreground hover:underline">Sơ đồ trang (Sitemap XML)</a></li>
          </ul>
          <p className="text-[11px] text-muted-foreground/75 pt-2">
            Website sử dụng cookie và dịch vụ bên thứ ba (như Google AdSense, Vercel Analytics) để phân tích lưu lượng và phân phát quảng cáo phù hợp. Xem chi tiết tại{' '}
            <a href="/privacy.html" className="underline hover:text-foreground">Chính sách quyền riêng tư</a>.
          </p>
        </div>
      </div>

      <div className="border-t border-border px-4 lg:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground/60">
        <span>© {new Date().getFullYear()} Toolchoice (www.toolchoice.site). Bảo lưu mọi quyền.</span>
        <div className="flex flex-wrap gap-4">
          <a href="/about.html" className="hover:text-foreground">Giới thiệu</a>
          <a href="/privacy.html" className="hover:text-foreground">Quyền riêng tư</a>
          <a href="/terms.html" className="hover:text-foreground">Điều khoản</a>
          <a href="/contact.html" className="hover:text-foreground">Liên hệ</a>
        </div>
      </div>
    </footer>
  );
}
