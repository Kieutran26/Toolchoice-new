import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS = {
  analytics: 'ANALYTICS',
  ai_ml: 'AI/ML',
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

export default function ToolCard({ tool, onSelect, dimmed }) {
  return (
    <div
      onClick={() => onSelect(tool)}
      className={cn(
        "circuit-glow rounded bg-card border border-border cursor-pointer group transition-all duration-200",
        dimmed && "opacity-30 pointer-events-none"
      )}
    >
      {/* Feature Image */}
      <div className="relative aspect-video overflow-hidden rounded-t scanline-overlay">
        {tool.feature_image_url ? (
          <img
            src={tool.feature_image_url}
            alt={tool.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <span className="text-3xl font-bold text-muted-foreground/20 font-mono">{tool.name?.[0]}</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="text-xs font-mono text-primary tracking-wider flex items-center gap-1.5">
            <ExternalLink className="w-3.5 h-3.5" />
            XEM CHI TIẾT
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          {tool.logo_url ? (
            <img src={tool.logo_url} alt="" className="w-8 h-8 rounded flex-shrink-0 bg-secondary object-contain" />
          ) : (
            <div className="w-8 h-8 rounded bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold font-mono text-primary">{tool.name?.[0]}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground truncate">{tool.name}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
              {tool.short_description}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <PricingBadge pricing={tool.pricing} />
          <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-1.5 py-0 h-5 border-border text-muted-foreground">
            {CATEGORY_LABELS[tool.category] || tool.category?.toUpperCase()}
          </Badge>
          {tool.has_api && (
            <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-1.5 py-0 h-5 border-primary/30 text-primary/70">
              API
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

function PricingBadge({ pricing }) {
  if (pricing === 'free') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'hsl(var(--free-color) / 0.12)', color: 'hsl(var(--free-color))', border: '1px solid hsl(var(--free-color) / 0.25)' }}>
        FREE
      </span>
    );
  }
  if (pricing === 'paid') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'hsl(var(--paid-color) / 0.12)', color: 'hsl(var(--paid-color))', border: '1px solid hsl(var(--paid-color) / 0.25)' }}>
        PAID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
      FREEMIUM
    </span>
  );
}