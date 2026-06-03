import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolCard from './ToolCard';
import { getCategoryLabel, getCategoryIcon } from "@/lib/tool-categories";

const MAX_VISIBLE = 8;

export default function CategorySection({ category, tools, onSelectTool, pricingFilter }) {
  const label = getCategoryLabel(category);
  const Icon = getCategoryIcon(category);
  const visible = tools.slice(0, MAX_VISIBLE);
  const remaining = tools.length - MAX_VISIBLE;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary flex-shrink-0" />}
          <span className="text-xs font-mono font-bold text-foreground tracking-[0.15em] uppercase">
            {label}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/50 tabular-nums">
            [{tools.length}]
          </span>
        </div>
        {remaining > 0 && (
          <Link
            to={`/category/${encodeURIComponent(category)}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded more-button transition-all duration-200 text-[10px] font-mono font-bold tracking-wider shadow-sm"
          >
            +{remaining} MORE
            <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {visible.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onSelect={onSelectTool}
            dimmed={pricingFilter && tool.pricing !== pricingFilter}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="border-b border-border/40 pt-2" />
    </div>
  );
}
