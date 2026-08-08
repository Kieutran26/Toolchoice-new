import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listTools } from '@/api/toolsClient';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Menu, Percent, Copy, Check, ExternalLink, Gift, CheckCircle2, Tag, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import CommandSidebar from '@/components/layout/CommandSidebar';
import ThemeToggle from '@/components/layout/ThemeToggle';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import { cn } from '@/lib/utils';
import { categoryToSlug } from '@/lib/tool-categories';

export default function Deals() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: tools = [], isLoading, error } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
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

  const deals = useMemo(() => tools.filter((t) => t.has_promotion), [tools]);

  return (
    <div className="min-h-screen bg-background">
      <CommandSidebar
        activeCategory="deals"
        onCategoryChange={(nextCategory) => {
          if (nextCategory === 'all') {
            navigate('/');
          } else {
            const catSlug = categoryToSlug(nextCategory);
            navigate(`/category/${catSlug}`);
          }
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
        onSelectTool={setSelectedTool}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Sticky Header Container */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
              >
                <Menu className="w-4 h-4" />
              </button>
              <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono tracking-wider">BACK</span>
              </Link>
              <div className="w-px h-4 bg-border" />
              <div className="flex items-center gap-2.5">
                <Percent className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-none">Deals & Ưu đãi</h2>
                  <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider mt-1">
                    {deals.length} ƯU ĐÃI ĐANG HOẠT ĐỘNG
                  </p>
                </div>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Deals Grid */}
        <div className="flex-1 p-4 lg:p-5">
          {error ? (
            <div className="rounded border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-xs font-mono text-destructive tracking-wider">SUPABASE LOAD ERROR</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 rounded-lg border border-border bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : deals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Gift className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Hiện chưa có ưu đãi nào đang hoạt động.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {deals.map((tool) => (
                <DealCard key={tool.id} tool={tool} onSelect={setSelectedTool} />
              ))}
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-border px-4 lg:px-5 py-2 bg-secondary/20">
          <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">
            {'>'} neural-index --view=deals // {deals.length} ưu đãi đã tải
          </p>
        </div>
      </div>

      <ToolDetailDrawer
        tool={selectedTool}
        isOpen={!!selectedTool}
        onClose={() => setSelectedTool(null)}
      />
    </div>
  );
}

function DealCard({ tool, onSelect }) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async (e) => {
    e.stopPropagation();
    if (!tool.promotion_code) return;
    try {
      await navigator.clipboard.writeText(tool.promotion_code);
      setCopied(true);
      toast({
        title: (
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            Đã sao chép mã ưu đãi
          </span>
        ),
        description: (
          <span className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-400/15 border border-amber-400/30 font-mono text-xs font-bold tracking-wider text-amber-600 dark:text-amber-300">
            <Tag className="w-3 h-3" />
            {tool.promotion_code}
          </span>
        ),
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: (
          <span className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Không thể sao chép mã
          </span>
        ),
        description: 'Trình duyệt chặn quyền truy cập clipboard. Vui lòng sao chép thủ công.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      className="rounded-lg border border-amber-400/30 bg-gradient-to-br from-amber-400/[0.06] to-transparent p-4 space-y-3 cursor-pointer hover:border-amber-400/50 hover:bg-amber-400/[0.08] transition-all duration-200"
    >
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-contain bg-secondary" onError={(e) => e.currentTarget.remove()} />
          ) : (
            <span className="text-base font-bold font-mono text-primary">{tool.name?.[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate">{tool.name}</h3>
          <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">
            {tool.promotion_description || tool.short_description}
          </p>
        </div>
      </div>

      {tool.promotion_code && (
        <button
          onClick={handleCopyCode}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-dashed border-amber-400/40 bg-amber-400/10 text-amber-600 dark:text-amber-300 transition-colors hover:bg-amber-400/15"
        >
          <span className="text-xs font-mono font-bold tracking-wider truncate">{tool.promotion_code}</span>
          {copied ? <Check className="w-3.5 h-3.5 flex-shrink-0" /> : <Copy className="w-3.5 h-3.5 flex-shrink-0" />}
        </button>
      )}

      {tool.website_url && (
        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider text-muted-foreground hover:text-primary transition-colors"
          )}
        >
          <ExternalLink className="w-3 h-3" />
          TRUY CẬP WEBSITE
        </a>
      )}
    </div>
  );
}
