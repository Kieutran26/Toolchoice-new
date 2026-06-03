import React from 'react';
import ToolCard from './ToolCard';
import { Skeleton } from "@/components/ui/skeleton";

export default function ToolGrid({ tools, isLoading, onSelectTool, activePricingFilter }) {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onSelect={onSelectTool}
          dimmed={activePricingFilter && tool.pricing !== activePricingFilter}
        />
      ))}
    </div>
  );
}