export default function AdsterraBanner() {
  return (
    <aside aria-label="Quảng cáo" className="col-span-full my-3 flex min-w-0 flex-col items-center gap-2 overflow-hidden border-y border-border py-4">
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Quảng cáo</span>
      <iframe
        title="Quảng cáo Adsterra"
        src="/adsterra-banner.html"
        width="300"
        height="250"
        loading="lazy"
        className="block max-w-full border-0"
      />
    </aside>
  );
}
