export default function PublisherLinks() {
  return (
    <nav aria-label="Thông tin Toolchoice" className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground leading-relaxed">
      <a className="hover:underline" href="/about.html">Giới thiệu</a>
      <a className="hover:underline" href="/choosing-tools.html">Hướng dẫn chọn công cụ</a>
      <a className="hover:underline" href="/contact.html">Liên hệ</a>
      <a className="hover:underline" href="/privacy.html">Quyền riêng tư</a>
    </nav>
  );
}