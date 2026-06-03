import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Menu } from 'lucide-react';
import CommandSidebar from '@/components/layout/CommandSidebar';
import DataTicker from '@/components/layout/DataTicker';
import ToolGrid from '@/components/tools/ToolGrid';
import ToolDetailDrawer from '@/components/tools/ToolDetailDrawer';
import PricingFilter from '@/components/tools/PricingFilter';
import ThemeToggle from '@/components/layout/ThemeToggle';

const CATEGORY_LABELS = {
  analytics: 'ANALYTICS',
  ai_ml: 'AI / ML',
  design: 'DESIGN',
  devtools: 'DEV TOOLS',
  database: 'DATABASE',
  hosting: 'HOSTING',
  security: 'SECURITY',
  marketing: 'MARKETING',
  productivity: 'PRODUCTIVITY',
  communication: 'COMMS',
  payments: 'PAYMENTS',
  automation: 'AUTOMATION',
};

export default function CategoryPage() {
  const { category } = useParams();
  const [selectedTool, setSelectedTool] = useState(null);
  const [pricingFilter, setPricingFilter] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: () => base44.entities.Tool.list('-created_date', 200),
  });

  const categoryCounts = useMemo(() => {
    const counts = {};
    tools.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return counts;
  }, [tools]);

  const filteredTools = useMemo(() => {
    let result = tools.filter(t => t.category === category);
    if (pricingFilter) result = result.filter(t => t.pricing === pricingFilter);
    return result;
  }, [tools, category, pricingFilter]);

  const label = CATEGORY_LABELS[category] || category?.toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <CommandSidebar
        activeCategory={category}
        onCategoryChange={() => {}}
        searchQuery=""
        onSearchChange={() => {}}
        categoryCounts={categoryCounts}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        <DataTicker totalTools={tools.length} categories={categoryCounts} />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 lg:px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden w-8 h-8 rounded flex items-center justify-center hover:bg-accent text-muted-foreground"
            >
              <Menu className="w-4 h-4" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono tracking-wider">BACK</span>
            </Link>
            <div className="w-px h-4 bg-border" />
            <div>
              <h2 className="text-sm font-semibold text-foreground">{label}</h2>
              <p className="text-[10px] font-mono text-muted-foreground/60 tracking-wider">
                {filteredTools.length} RESULTS FOUND
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PricingFilter active={pricingFilter} onChange={setPricingFilter} />
            <ThemeToggle />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 p-4 lg:p-5">
          <ToolGrid
            tools={filteredTools}
            isLoading={isLoading}
            onSelectTool={setSelectedTool}
            activePricingFilter={pricingFilter}
          />
        </div>

        {/* Terminal Footer */}
        <div className="border-t border-border px-4 lg:px-5 py-2 bg-secondary/20">
          <p className="text-[10px] font-mono text-muted-foreground/40 tracking-wider">
            {'>'} neural-index --category={category} // {filteredTools.length} tools loaded
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