import React from 'react';
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: null, label: 'TẤT CẢ' },
  { id: 'free', label: 'MIỄN PHÍ', colorClass: 'text-[hsl(134,60%,35%)] dark:text-[hsl(120,100%,63%)]' },
  { id: 'freemium', label: 'CÓ FREE TRIAL', colorClass: 'text-[hsl(36,90%,42%)] dark:text-[hsl(51,100%,50%)]' },
  { id: 'paid', label: 'TRẢ PHÍ', colorClass: 'text-[hsl(0,75%,45%)] dark:text-[hsl(0,100%,65%)]' },
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