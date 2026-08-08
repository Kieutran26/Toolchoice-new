import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ToolCard from './ToolCard';
import { Skeleton } from "@/components/ui/skeleton";

const BATCH_SIZE = 30;

export default function ToolGrid({ tools, isLoading, onSelectTool, activePricingFilter }) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef(null);

  // Reset the batch size whenever the underlying tool list changes (new search/filter/category).
  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [tools]);

  const hasMore = visibleCount < tools.length;

  useEffect(() => {
    if (!hasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + BATCH_SIZE);
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {Array(8).fill(0).map((_, i) => (
          <div key={i} className="rounded bg-card border border-border">
            <Skeleton className="aspect-video w-full rounded-t" />
            <div className="p-3 space-y-2">
              <div className="flex items-start gap-2.5">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-xl bg-secondary border border-border flex items-center justify-center mb-4">
          <span className="text-2xl font-mono text-muted-foreground/30">∅</span>
        </div>
        <p className="text-sm font-mono text-muted-foreground tracking-wider">KHÔNG TÌM THẤY CÔNG CỤ NÀO</p>
        <p className="text-xs text-muted-foreground/50 mt-1 font-mono">Thử thay đổi bộ lọc hoặc từ khóa</p>
      </div>
    );
  }

  const visibleTools = tools.slice(0, visibleCount);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
        {visibleTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onSelect={onSelectTool}
            dimmed={activePricingFilter && tool.pricing !== activePricingFilter}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + BATCH_SIZE)}
            className="flex items-center gap-1.5 px-4 py-2 rounded text-[10px] font-mono font-bold tracking-wider text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 bg-secondary/30 hover:bg-accent transition-all duration-200"
          >
            XEM THÊM
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
