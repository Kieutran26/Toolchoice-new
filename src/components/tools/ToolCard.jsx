import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/tool-categories";

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
            loading="lazy"
            decoding="async"
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
          <ToolLogo tool={tool} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground truncate">{tool.name}</h3>
              {tool.website_url && (
                <a
                  href={tool.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-primary transition-all flex-shrink-0 w-6 h-6 rounded border border-border hover:border-primary/30 bg-secondary/30 hover:bg-accent flex items-center justify-center"
                  title="Truy cập website"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
              {tool.short_description}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <PricingBadge pricing={tool.pricing} />
          {(tool.categories?.length ? tool.categories : [tool.category]).map((category) => (
            <Badge key={category} variant="outline" className="text-[10px] font-mono tracking-wider px-1.5 py-0 h-5 border-border text-muted-foreground">
              {getCategoryLabel(category)}
            </Badge>
          ))}
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

function ToolLogo({ tool }) {
  return (
    <div className="relative w-8 h-8 rounded flex-shrink-0 bg-secondary border border-border overflow-hidden">
      {tool.logo_url && (
        <img
          src={tool.logo_url}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain bg-secondary"
          onError={(event) => {
            event.currentTarget.remove();
          }}
        />
      )}
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-xs font-bold font-mono text-primary">{tool.name?.[0]}</span>
      </div>
    </div>
  );
}

function PricingBadge({ pricing }) {
  if (pricing === 'free') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'hsl(var(--free-color) / 0.12)', color: 'hsl(var(--free-color))', border: '1px solid hsl(var(--free-color) / 0.25)' }}>
        MIỄN PHÍ
      </span>
    );
  }
  if (pricing === 'paid') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
        style={{ background: 'hsl(var(--paid-color) / 0.12)', color: 'hsl(var(--paid-color))', border: '1px solid hsl(var(--paid-color) / 0.25)' }}>
        TRẢ PHÍ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded"
      style={{ background: 'hsl(var(--trial-color) / 0.12)', color: 'hsl(var(--trial-color))', border: '1px solid hsl(var(--trial-color) / 0.25)' }}>
      CÓ FREE TRIAL
    </span>
  );
}
