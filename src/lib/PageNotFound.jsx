import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import SiteFooter from '@/components/layout/SiteFooter';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead
        title="Không tìm thấy trang (404) | Toolchoice"
        description="Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển trên Toolchoice."
        canonicalPath={location.pathname}
        robots="noindex, nofollow"
      />
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-6 rounded-xl border border-border bg-card p-8">
          <div className="space-y-2">
            <p className="text-xs font-mono text-primary tracking-widest uppercase">LỖI 404 · KHÔNG TÌM THẤY TRANG</p>
            <h1 className="text-4xl font-bold text-foreground">Trang không tồn tại</h1>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Đường dẫn <code className="px-1.5 py-0.5 rounded bg-secondary text-foreground">/{pageName}</code> không tồn tại hoặc đã được thay đổi. Bạn có thể quay về trang chủ hoặc khám phá các chuyên mục chính bên dưới:
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-xs font-mono font-bold rounded-lg custom-primary-button"
            >
              VỀ TRANG CHỦ TOOLCHOICE
            </Link>
            <Link
              to="/blog"
              className="inline-flex items-center px-4 py-2 text-xs font-mono font-bold rounded-lg border border-border bg-secondary/40 text-foreground hover:bg-accent transition-colors"
            >
              ĐỌC BLOG &amp; CẨM NANG
            </Link>
          </div>

          <div className="pt-4 border-t border-border text-xs text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-2">
            <Link to="/category/ai" className="hover:text-primary hover:underline">Công cụ AI</Link>
            <Link to="/category/thiet-ke" className="hover:text-primary hover:underline">Thiết kế</Link>
            <Link to="/category/lap-trinh" className="hover:text-primary hover:underline">Lập trình</Link>
            <Link to="/category/nang-suat" className="hover:text-primary hover:underline">Năng suất</Link>
            <Link to="/deals" className="hover:text-primary hover:underline">Deals &amp; Ưu đãi</Link>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
