import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ChevronRight, Shield, Percent, Sparkles, Shuffle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { buildCategoryOptions } from "@/lib/tool-categories";
import { useQuery } from '@tanstack/react-query';
import { listTools } from '@/api/toolsClient';

export default function CommandSidebar({ activeCategory, onCategoryChange, searchQuery, onSearchChange, categoryCounts, isMobileOpen, onMobileClose, onSelectTool }) {
  const categories = buildCategoryOptions(categoryCounts);
  const location = useLocation();
  const isDealsActive = location.pathname.startsWith('/deals');

  const { data: tools = [] } = useQuery({
    queryKey: ['supabase-tools', 'all'],
    queryFn: () => listTools(1000),
  });

  const handleRandomSelect = () => {
    if (!tools || tools.length === 0) return;

    let visitedIds = [];
    try {
      const stored = localStorage.getItem('toolchoice_visited_ids');
      if (stored) {
        visitedIds = JSON.parse(stored);
        if (!Array.isArray(visitedIds)) {
          visitedIds = [];
        }
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }

    let availableTools = tools.filter(t => !visitedIds.includes(t.id));

    if (availableTools.length === 0) {
      visitedIds = [];
      availableTools = tools;
    }

    const randomIndex = Math.floor(Math.random() * availableTools.length);
    const chosenTool = availableTools[randomIndex];

    if (chosenTool) {
      visitedIds.push(chosenTool.id);
      try {
        localStorage.setItem('toolchoice_visited_ids', JSON.stringify(visitedIds));
      } catch (e) {
        console.error("Error writing localStorage:", e);
      }

      onSelectTool?.(chosenTool);
    }
  };

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-border z-50 flex flex-col transition-transform duration-200",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Toolchoice" className="w-8 h-8 rounded" />
            <div>
              <h1 className="text-sm font-bold tracking-wider text-foreground font-mono">TOOLCHOICE</h1>
            </div>
          </div>
        </div>

        <div className="px-3 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs font-mono bg-secondary border-border placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <p className="px-2 py-1.5 text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em]">
            DANH MỤC
          </p>
          <div className="space-y-0.5 mt-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onCategoryChange(cat.id);
                    onMobileClose?.();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded text-xs font-mono transition-all duration-200",
                    isActive
                      ? "sidebar-active-item font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left tracking-wide">{cat.label}</span>
                  {cat.count !== null && (
                    <span className={cn(
                       "text-[10px] font-mono tabular-nums min-w-[20px] text-right",
                       isActive ? "sidebar-count" : "text-muted-foreground/50"
                    )}>
                      {cat.count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Divider separating Deals from regular categories */}
          <div className="my-3 border-t border-dashed border-border" />

          <Link
            to="/deals"
            onClick={() => onMobileClose?.()}
            className={cn(
              "relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-mono font-bold tracking-[0.15em] overflow-hidden transition-all duration-200 border",
              isDealsActive
                ? "bg-amber-400/15 border-amber-400/50 text-amber-600 dark:text-amber-300 shadow-sm"
                : "bg-gradient-to-r from-amber-400/10 to-transparent border-amber-400/25 text-amber-600/80 dark:text-amber-300/80 hover:from-amber-400/15 hover:border-amber-400/40"
            )}
          >
            <Percent className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">DEALS & ƯU ĐÃI</span>
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 animate-pulse" />
          </Link>
        </nav>

        <div className="px-3 py-3 border-t border-border space-y-3 flex flex-col">
          <button
            onClick={handleRandomSelect}
            disabled={tools.length === 0}
            className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded text-[10px] font-mono font-bold tracking-wider custom-primary-button transition-all duration-300 active:scale-95 shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shuffle className="w-3 h-3 text-white transition-transform duration-500 group-hover:rotate-180" />
            RANDOM TOOL
          </button>

          <a 
            href="https://unikorn.vn/p/toolchoice?ref=embed-toolchoice" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block w-full transition-transform hover:scale-[1.02] duration-200"
          >
            <img 
              src="https://unikorn.vn/api/widgets/badge/toolchoice?theme=light" 
              alt="ToolChoice trên Unikorn.vn" 
              style={{ width: '100%', height: 'auto', maxWidth: '180px' }}
              width="256" 
              height="64"
              className="mx-auto block"
            />
          </a>
        </div>
      </aside>
    </>
  );
}
