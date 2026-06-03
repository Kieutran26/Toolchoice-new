import React from 'react';
import { Search, Layers, Brain, Palette, Code2, Database, Server, Shield, Megaphone, Zap, MessageSquare, CreditCard, Bot, ChevronRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: 'all', label: 'ALL MODULES', icon: Layers, count: null },
  { id: 'analytics', label: 'ANALYTICS', icon: Zap, count: 0, trending: true },
  { id: 'ai_ml', label: 'AI / ML', icon: Brain, count: 0, trending: true },
  { id: 'design', label: 'DESIGN', icon: Palette, count: 0 },
  { id: 'devtools', label: 'DEV TOOLS', icon: Code2, count: 0 },
  { id: 'database', label: 'DATABASE', icon: Database, count: 0 },
  { id: 'hosting', label: 'HOSTING', icon: Server, count: 0 },
  { id: 'security', label: 'SECURITY', icon: Shield, count: 0 },
  { id: 'marketing', label: 'MARKETING', icon: Megaphone, count: 0 },
  { id: 'productivity', label: 'PRODUCTIVITY', icon: Zap, count: 0 },
  { id: 'communication', label: 'COMMS', icon: MessageSquare, count: 0 },
  { id: 'payments', label: 'PAYMENTS', icon: CreditCard, count: 0 },
  { id: 'automation', label: 'AUTOMATION', icon: Bot, count: 0 },
];

export default function CommandSidebar({ activeCategory, onCategoryChange, searchQuery, onSearchChange, categoryCounts, isMobileOpen, onMobileClose }) {
  const categories = CATEGORIES.map(cat => ({
    ...cat,
    count: cat.id === 'all' ? null : (categoryCounts?.[cat.id] || 0)
  }));

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onMobileClose} />
      )}
      
      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-border z-50 flex flex-col transition-transform duration-200",
        "lg:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Layers className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-foreground font-mono">NEURAL INDEX</h1>
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest">v2.4.1 // ACTIVE</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm... (⌘K)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 h-8 text-xs font-mono bg-secondary border-border placeholder:text-muted-foreground/50 focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Categories */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          <p className="px-2 py-1.5 text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em]">
            FILTER ARRAY
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
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="flex-1 text-left tracking-wide">{cat.label}</span>
                  {cat.trending && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary status-pulse flex-shrink-0" />
                  )}
                  {cat.count !== null && (
                    <span className={cn(
                      "text-[10px] font-mono tabular-nums min-w-[20px] text-right",
                      isActive ? "text-primary/70" : "text-muted-foreground/50"
                    )}>
                      {cat.count}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="px-3 py-3 border-t border-border">
          <p className="text-[10px] font-mono text-muted-foreground/40 text-center tracking-wider">
            SYS::NEURAL_INDEX // 2026
          </p>
        </div>
      </aside>
    </>
  );
}