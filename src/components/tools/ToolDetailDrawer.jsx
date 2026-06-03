import React from 'react';
import { X, ExternalLink, Globe, Cpu, Check, Layers } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

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

export default function ToolDetailDrawer({ tool, isOpen, onClose }) {
  if (!tool) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[520px] lg:w-[600px] bg-card border-l border-border z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-secondary/30">
              <span className="text-[10px] font-mono text-muted-foreground tracking-[0.15em]">
                TOOL::DETAIL_VIEW // {tool.name?.toUpperCase()}
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Hero Image */}
              <div className="relative aspect-video w-full scanline-overlay">
                {tool.feature_image_url ? (
                  <img src={tool.feature_image_url} alt={tool.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <span className="text-6xl font-bold text-muted-foreground/10 font-mono">{tool.name?.[0]}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              <div className="px-5 py-5 space-y-5 -mt-10 relative">
                {/* Title Block */}
                <div className="flex items-start gap-3">
                  {tool.logo_url ? (
                    <img src={tool.logo_url} alt="" className="w-12 h-12 rounded-lg bg-secondary border border-border object-contain flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold font-mono text-primary">{tool.name?.[0]}</span>
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{tool.name}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{tool.short_description}</p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <PricingBadgeLarge pricing={tool.pricing} />
                  <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-2 py-0.5 border-border text-muted-foreground">
                    <Layers className="w-3 h-3 mr-1" />
                    {CATEGORY_LABELS[tool.category]}
                  </Badge>
                  {tool.has_api && (
                    <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-2 py-0.5 border-primary/30 text-primary">
                      <Cpu className="w-3 h-3 mr-1" />
                      API AVAILABLE
                    </Badge>
                  )}
                </div>

                <Separator className="bg-border" />

                {/* Technical Specs Grid */}
                <div>
                  <h3 className="text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em] mb-3">
                    TECHNICAL SPECS
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <SpecItem label="PRICING" value={tool.pricing?.toUpperCase() || 'N/A'} />
                    <SpecItem label="API" value={tool.has_api ? 'YES' : 'NO'} />
                    <SpecItem label="CATEGORY" value={CATEGORY_LABELS[tool.category] || 'N/A'} />
                    <SpecItem label="STATUS" value={tool.is_trending ? 'TRENDING' : 'STABLE'} highlight={tool.is_trending} />
                  </div>
                </div>

                {/* Platforms */}
                {tool.platforms?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em] mb-3">
                      PLATFORMS
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.platforms.map((p, i) => (
                        <span key={i} className="text-[10px] font-mono px-2 py-1 rounded bg-secondary border border-border text-foreground/80">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {tool.full_description && (
                  <div>
                    <h3 className="text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em] mb-3">
                      OVERVIEW
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.full_description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {tool.features?.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-mono font-semibold text-muted-foreground tracking-[0.15em] mb-3">
                      KEY FEATURES
                    </h3>
                    <div className="space-y-2">
                      {tool.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <Check className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground/80">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                {tool.website_url && (
                  <div className="pt-2">
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono tracking-wider text-xs h-10">
                        <Globe className="w-3.5 h-3.5 mr-2" />
                        TRUY CẬP WEBSITE
                        <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SpecItem({ label, value, highlight }) {
  return (
    <div className="px-3 py-2.5 rounded bg-secondary/50 border border-border">
      <p className="text-[9px] font-mono text-muted-foreground/60 tracking-[0.15em]">{label}</p>
      <p className={cn(
        "text-xs font-mono font-semibold mt-0.5",
        highlight ? "text-primary" : "text-foreground"
      )}>
        {value}
      </p>
    </div>
  );
}

function PricingBadgeLarge({ pricing }) {
  if (pricing === 'free') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded"
        style={{ background: 'hsl(var(--free-color) / 0.12)', color: 'hsl(var(--free-color))', border: '1px solid hsl(var(--free-color) / 0.25)' }}>
        FREE
      </span>
    );
  }
  if (pricing === 'paid') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded"
        style={{ background: 'hsl(var(--paid-color) / 0.12)', color: 'hsl(var(--paid-color))', border: '1px solid hsl(var(--paid-color) / 0.25)' }}>
        PAID
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
      FREEMIUM
    </span>
  );
}