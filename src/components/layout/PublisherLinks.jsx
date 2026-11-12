import { Link } from 'react-router-dom';

export default function PublisherLinks() {
  return (
    <nav aria-label="Thông tin Toolchoice" className="flex flex-wrap gap-x-3 gap-y-2 text-xs text-muted-foreground leading-relaxed">
      <Link className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" to="/blog">Blog & Hướng dẫn</Link>
      <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href="/choosing-tools.html">Cách chọn công cụ</a>
      <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href="/about.html">Giới thiệu</a>
      <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href="/contact.html">Liên hệ</a>
      <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href="/privacy.html">Quyền riêng tư</a>
      <a className="inline-flex min-h-11 items-center hover:text-foreground hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring" href="/terms.html">Điều khoản</a>
    </nav>
  );
}
