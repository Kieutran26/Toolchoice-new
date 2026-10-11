import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Edit2, Trash2, ArrowUpRight, Copy, Filter, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DuplicateToolsPanel({
  duplicateClusters = [],
  onEditTool,
  onDeleteTool,
  onFilterDuplicates,
  isFilteringDuplicates = false,
}) {
  const [isOpen, setIsOpen] = useState(true);

  const totalDuplicateTools = duplicateClusters.reduce((sum, cluster) => sum + cluster.tools.length, 0);

  if (duplicateClusters.length === 0) {
    return (
      <section className="rounded-xl border border-emerald-950/60 bg-emerald-950/10 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-xs text-emerald-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Hệ thống sạch: Không phát hiện công cụ nào bị trùng lặp tên hoặc tên miền trong cơ sở dữ liệu.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-5 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-sm text-amber-200 flex items-center gap-1.5 font-mono">
                PHÁT HIỆN {duplicateClusters.length} NHÓM CÔNG CỤ TRÙNG LẶP
              </h2>
              <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-300 border-amber-500/40">
                {totalDuplicateTools} bản ghi
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tự động quét toàn bộ cơ sở dữ liệu để tìm các tool trùng tên hoặc trỏ cùng một tên miền website.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onFilterDuplicates && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onFilterDuplicates}
              className={`text-xs h-8 font-mono border-amber-500/40 ${
                isFilteringDuplicates
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold'
                  : 'text-amber-300 hover:bg-amber-500/20 hover:text-white'
              }`}
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" />
              {isFilteringDuplicates ? 'Bỏ lọc trùng lặp' : 'Lọc bảng bên dưới'}
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(prev => !prev)}
            className="text-xs h-8 text-slate-400 hover:text-white"
          >
            {isOpen ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" /> Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" /> Mở rộng ({duplicateClusters.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Clusters List */}
      {isOpen && (
        <div className="space-y-3 pt-1">
          {duplicateClusters.map((cluster, index) => (
            <div
              key={cluster.id || index}
              className="rounded-lg border border-slate-800 bg-slate-950/70 p-3.5 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      cluster.type === 'name'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {cluster.type === 'name' ? 'TRÙNG TÊN' : 'CÙNG DOMAIN'}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-200">{cluster.title}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {cluster.tools.length} bản ghi
                </span>
              </div>

              {/* Tools in this cluster */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {cluster.tools.map(tool => (
                  <div
                    key={tool.id}
                    className="flex items-start justify-between gap-2 p-2.5 rounded-md bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-xs text-white truncate max-w-[160px]">
                          {tool.name}
                        </strong>
                        <span className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
                          #{tool.id}
                        </span>
                        {tool.pricing && (
                          <span className="text-[10px] font-mono text-slate-400">
                            [{tool.pricing}]
                          </span>
                        )}
                      </div>

                      {tool.short_description && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                          "{tool.short_description}"
                        </p>
                      )}

                      {(tool.website_url || tool.link) && (
                        <a
                          href={tool.website_url || tool.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-slate-500 hover:text-primary flex items-center gap-1 truncate max-w-xs font-mono"
                        >
                          {tool.website_url || tool.link}
                          <ArrowUpRight className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTool(tool)}
                        className="h-7 px-2 text-xs text-slate-300 hover:text-white hover:bg-slate-800"
                        title="Chỉnh sửa công cụ này"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1 text-primary" />
                        Sửa
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTool(tool)}
                        className="h-7 px-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20"
                        title="Xóa công cụ trùng lặp này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
