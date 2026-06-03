import React from 'react';
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: null, label: 'ALL' },
  { id: 'free', label: 'FREE', colorClass: 'text-[hsl(120,100%,63%)]' },
  { id: 'freemium', label: 'FREEMIUM', colorClass: 'text-primary' },
  { id: 'paid', label: 'PAID', colorClass: 'text-[hsl(51,100%,50%)]' },
];

export default function PricingFilter({ active, onChange }) {
  return (
    <div className="flex items-center gap-1">
      {FILTERS.map(f => (
        <button
          key={f.id || 'all'}
          onClick={() => onChange(active === f.id ? null : f.id)}
          className={cn(
            "text-[10px] font-mono font-semibold tracking-wider px-2.5 py-1 rounded border transition-all duration-200",
            active === f.id
              ? "bg-accent border-primary/30 text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}