import React from 'react';
import { X, ExternalLink, Globe, Cpu, Check, Layers, Gift } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";
import { getCategoryLabel } from "@/lib/tool-categories";

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
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <ToolLogoLarge tool={tool} />
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-foreground truncate">{tool.name}</h2>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5 line-clamp-2">{tool.short_description}</p>
                    </div>
                  </div>
                  {tool.website_url && (
                    <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                      <Button className="custom-primary-button font-mono tracking-wider text-[10px] sm:text-xs px-3 h-9 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        TRUY CẬP WEBSITE
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                  )}
                </div>

                {/* Referral Offer */}
                {tool.referral_offer && (
                  <a
                    href={tool.website_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold tracking-wide px-2.5 py-1.5 rounded-md bg-amber-400/15 text-amber-600 dark:text-amber-300 border border-amber-400/40 shadow-[0_0_0_1px_rgba(251,191,36,0.08)] hover:bg-amber-400/25 transition-colors"
                  >
                    <Gift className="w-3.5 h-3.5 flex-shrink-0" />
                    {tool.referral_offer}
                  </a>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5">
                  <PricingBadgeLarge pricing={tool.pricing} />
                  {(tool.categories?.length ? tool.categories : [tool.category]).map((category) => (
                    <Badge key={category} variant="outline" className="text-[10px] font-mono tracking-wider px-2 py-0.5 border-border text-muted-foreground">
                      <Layers className="w-3 h-3 mr-1" />
                      {getCategoryLabel(category)}
                    </Badge>
                  ))}
                  {tool.has_api && (
                    <Badge variant="outline" className="text-[10px] font-mono tracking-wider px-2 py-0.5 border-primary/30 text-primary">
                      <Cpu className="w-3 h-3 mr-1" />
                      API AVAILABLE
                    </Badge>
                  )}
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


              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ToolLogoLarge({ tool }) {
  return (
    <div className="relative w-12 h-12 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
      {tool.logo_url && (
        <img
          src={tool.logo_url}
          alt=""
          className="absolute inset-0 w-full h-full object-contain bg-secondary"
          onError={(event) => {
            event.currentTarget.remove();
          }}
        />
      )}
      <div className="w-full h-full flex items-center justify-center">
        <span className="text-lg font-bold font-mono text-primary">{tool.name?.[0]}</span>
      </div>
    </div>
  );
}


function PricingBadgeLarge({ pricing }) {
  if (pricing === 'free') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded"
        style={{ background: 'hsl(var(--free-color) / 0.12)', color: 'hsl(var(--free-color))', border: '1px solid hsl(var(--free-color) / 0.25)' }}>
        MIỄN PHÍ
      </span>
    );
  }
  if (pricing === 'paid') {
    return (
      <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded"
        style={{ background: 'hsl(var(--paid-color) / 0.12)', color: 'hsl(var(--paid-color))', border: '1px solid hsl(var(--paid-color) / 0.25)' }}>
        TRẢ PHÍ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[10px] font-mono font-bold tracking-wider px-2 py-1 rounded"
      style={{ background: 'hsl(var(--trial-color) / 0.12)', color: 'hsl(var(--trial-color))', border: '1px solid hsl(var(--trial-color) / 0.25)' }}>
      CÓ FREE TRIAL
    </span>
  );
}
