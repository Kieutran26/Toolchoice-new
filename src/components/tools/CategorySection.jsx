import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ToolCard from './ToolCard';

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

const MAX_VISIBLE = 8;

export default function CategorySection({ category, tools, onSelectTool, pricingFilter }) {
  const label = CATEGORY_LABELS[category] || category.toUpperCase();
  const visible = tools.slice(0, MAX_VISIBLE);
  const remaining = tools.length - MAX_VISIBLE;

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em]">
            {label}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground/40 tabular-nums">
            [{tools.length}]
          </span>
        </div>
        {remaining > 0 && (
          <Link
            to={`/category/${category}`}
            className="flex items-center gap-1 text-[10px] font-mono text-primary hover:text-primary/80 transition-colors tracking-wider"
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