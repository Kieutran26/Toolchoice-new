import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Menu } from 'lucide-react';
import { getInitialTools, listTools } from '@/api/toolsClient';
import { buildToolEditorialReview, findToolBySlug, getToolSlug } from '@/lib/tool-content';
import { categoryToSlug } from '@/lib/tool-categories';
import CommandSidebar from '@/components/layout/CommandSidebar';
import SiteFooter from '@/components/layout/SiteFooter';
import SEOHead from '@/components/SEOHead';
import PageNotFound from '@/lib/PageNotFound';

export default function ToolDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: tools = getInitialTools() } = useQuery({
    queryKey: ['supabase-tools', 'all'], queryFn: () => listTools(1000), initialData: getInitialTools,
  });
  const tool = findToolBySlug(tools, slug);
  const categoryCounts = useMemo(() => {
    const counts = {};
    tools.forEach((item) => item.categories?.forEach((category) => {
      counts[category] = (counts[category] || 0) + 1;
    }));
    return counts;
  }, [tools]);
  if (!tool) return <PageNotFound />;
  const review = buildToolEditorialReview(tool, tools);
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title={`${tool.name}: thông tin, tính năng và danh mục`}
        description={tool.short_description || tool.full_description}
        canonicalPath={`/tool/${getToolSlug(tool)}`} />
      <CommandSidebar activeCategory={tool.category} categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen} onMobileClose={() => setIsMobileOpen(false)}
        onCategoryChange={(category) => navigate(category === 'all' ? '/' : `/category/${categoryToSlug(category)}`)}
        searchQuery="" onSearchChange={() => navigate('/')} onSelectTool={(selected) => navigate(`/tool/${getToolSlug(selected)}`)} />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="flex gap-4 items-center border-b border-border p-4">
          <button aria-label="Mở menu" className="lg:hidden p-2" onClick={() => setIsMobileOpen(true)}><Menu /></button>
          <nav aria-label="Đường dẫn" className="flex flex-wrap gap-2 text-sm">
            <Link className="underline" to="/">Trang chủ</Link><span>/</span>
            <Link className="underline" to={`/category/${categoryToSlug(tool.category)}`}>{tool.category}</Link><span>/</span><span>{tool.name}</span>
          </nav>
        </header>
        <article className="w-full max-w-4xl mx-auto p-5 lg:p-8 space-y-8 flex-1">
          <section className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{review.categoriesJoined} · Nhãn giá trong danh mục: {review.pricingLabel}</p>
            {review.overviewParagraphs.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
            {tool.website_url ? <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="inline-block underline font-semibold">Truy cập website {tool.name} (mở tab mới)</a> : <p>Website chính thức chưa có đường dẫn hợp lệ trong danh mục.</p>}
          </section>
          {review.prosList.length > 0 && <section className="space-y-3">
            <h2 className="text-xl font-semibold">Tính năng được ghi nhận</h2>
            <ul className="list-disc pl-5 space-y-2">{review.prosList.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          </section>}
          <aside className="rounded-lg border border-border bg-secondary/30 p-4 space-y-2 text-sm leading-relaxed">
            <h2 className="font-semibold">Phạm vi thông tin</h2>
            <p>{review.disclosure}</p>
            <p>Kiểm tra giá, giới hạn gói, giấy phép và chính sách dữ liệu trên website nhà cung cấp trước khi đăng ký. <a href="/choosing-tools.html" className="underline">Xem quy trình tự đánh giá công cụ</a>.</p>
            <p>Báo sai thông tin: <a className="underline" href="mailto:support@toolchoice.site">support@toolchoice.site</a>.</p>
          </aside>
          {review.alternatives.length > 0 && <section className="space-y-3">
            <h2 className="text-xl font-semibold">Khám phá thêm trong danh mục {review.primaryCategory}</h2>
            <p className="text-sm text-muted-foreground">Các mục dưới đây cùng danh mục rộng, có thể giải quyết những nhiệm vụ khác nhau. Đây không phải xếp hạng hay khẳng định chúng thay thế trực tiếp cho nhau.</p>
            <div className="overflow-x-auto"><table className="w-full text-sm border-collapse">
              <caption className="text-left mb-3">Thông tin để sàng lọc theo nhu cầu</caption>
              <thead><tr><th scope="col" className="text-left border border-border p-3">Công cụ</th><th scope="col" className="text-left border border-border p-3">Mô tả trong danh mục</th><th scope="col" className="text-left border border-border p-3">Nhãn giá</th></tr></thead>
              <tbody>{review.alternatives.map((item) => <tr key={item.id}><td className="border border-border p-3"><Link className="underline" to={`/tool/${item.slug}`}>{item.name}</Link></td><td className="border border-border p-3">{item.shortDescription}</td><td className="border border-border p-3">{item.pricingLabel}</td></tr>)}</tbody>
            </table></div>
          </section>}
          <p><Link className="underline" to="/blog">Đọc cẩm nang và ví dụ thực hành</Link></p>
        </article>
        <SiteFooter />
      </div>
    </div>
  );
}
