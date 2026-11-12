export default function DataTicker({ totalTools, categories }) {
  const summary = `DANH MỤC: ${totalTools} CÔNG CỤ · ${Object.keys(categories || {}).length} NHÓM · KIỂM TRA GIÁ MỚI NHẤT TẠI NHÀ CUNG CẤP`;
  return <div className="min-h-7 custom-data-ticker px-4 py-1 text-[10px] font-mono tracking-wide" aria-label="Thông tin danh mục">{summary}</div>;
}
