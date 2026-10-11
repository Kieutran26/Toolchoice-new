import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Loader2, Upload, CheckCircle2, RotateCcw, HelpCircle, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { adminJson, uploadAdminImage } from '@/api/adminClient';
import { parseReferral, findDuplicateTool } from '@/lib/tool-intake';
import { pasteImage } from '@/lib/clipboard-image';
import ImagePasteTarget from './ImagePasteTarget';

export default function QuickToolIntake({ formData, onChange, onDraft, onBusyChange, editing, disabled, existingTools = [], currentToolId = null, onSwitchToEdit }) {
  const [auto, setAuto] = useState(!editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notes, setNotes] = useState('');
  const [evidence, setEvidence] = useState(null);
  const controller = useRef(null);
  const attempted = useRef('');
  const fileInput = useRef(null);
  const latest = useRef(formData);
  latest.current = formData;
  const referral = parseReferral(formData.link);
  const { toast } = useToast();

  const duplicate = useMemo(() => {
    return findDuplicateTool(
      existingTools,
      { name: evidence?.draft?.name || formData.name, link: formData.link },
      currentToolId
    );
  }, [existingTools, formData.name, formData.link, evidence?.draft?.name, currentToolId]);

  useEffect(() => () => controller.current?.abort(), []);

  const analyze = async (link, customNotes = notes) => {
    if (busy || disabled) return;
    setBusy(true);
    onBusyChange(true);
    setError('');
    setEvidence(null);
    controller.current = new AbortController();
    try {
      const result = await adminJson(
        '/analyze',
        { link, notes: customNotes.trim() },
        'POST',
        controller.current.signal
      );
      // A result for a previous URL must not overwrite the current form.
      if (latest.current.link.trim() === link) {
        onDraft(result.draft);
        setEvidence(result);
        toast({
          title: 'AI đã điền bản nháp',
          description: `Đã hoàn tất phân tích cho "${result.draft.name || 'công cụ'}". Kiểm tra các trường bên dưới trước khi lưu.`,
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        attempted.current = '';
        setError(err.message || 'Không thể phân tích website.');
        toast({
          title: 'Lỗi phân tích',
          description: err.message || 'Không thể đọc website. Vui lòng thử lại hoặc điền thủ công.',
          variant: 'destructive',
        });
      }
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  useEffect(() => {
    const link = formData.link.trim();
    if (!auto || busy || disabled || !formData.gallery_images || !/^https?:\/\//i.test(link) || attempted.current === link) return;
    const timer = setTimeout(() => {
      attempted.current = link;
      analyze(link);
    }, 900);
    return () => clearTimeout(timer);
    // Re-run only when intake inputs change, not when the generated draft arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.link, formData.gallery_images, auto, busy, disabled]);

  const upload = async file => {
    if (!file || busy || disabled) return;
    setBusy(true);
    onBusyChange(true);
    setError('');
    try {
      const result = await uploadAdminImage(file);
      onChange({ target: { name: 'gallery_images', value: result.url } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      onBusyChange(false);
    }
  };

  return (
    <section onPaste={event => pasteImage(event, upload, busy || disabled)} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3.5">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2 text-sm text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Thêm tool bằng link và AI
        </h4>
        <span className="text-[10px] font-mono text-primary/80 bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          PROMPT CHUẨN TECH DIRECTORY
        </span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        AI tự đọc tiêu đề, meta tags, các tính năng và giá để điền bản nháp thuần Việt, súc tích và chính xác.
      </p>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-300" htmlFor="intake-link">
          Link website (giữ nguyên link giới thiệu/referral)
        </label>
        <Input
          disabled={disabled || busy}
          id="intake-link"
          value={formData.link}
          onChange={event => onChange({ target: { name: 'link', value: event.target.value } })}
          placeholder="https://website.com/?ref=your-code"
          className="bg-slate-900 border-slate-700 text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-medium text-slate-300 flex items-center gap-1" htmlFor="intake-notes">
            Gợi ý / Ghi chú thêm cho AI <span className="text-slate-500 font-normal">(tùy chọn)</span>
          </label>
          <span className="text-[10px] text-slate-500">Giúp AI hiểu đúng trọng tâm nếu web ít chữ</span>
        </div>
        <Input
          disabled={disabled || busy}
          id="intake-notes"
          value={notes}
          onChange={event => setNotes(event.target.value)}
          placeholder="VD: Tool motion design tạo hoạt ảnh UI/UX, có plugin Figma, miễn phí cơ bản..."
          className="bg-slate-900/80 border-slate-700/80 text-xs placeholder:text-slate-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          ref={fileInput}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={event => {
            const file = event.target.files?.[0];
            event.target.value = '';
            upload(file);
          }}
          className="hidden"
          aria-label="Chọn ảnh gallery"
        />
        <ImagePasteTarget label="ảnh gallery" onImage={upload} disabled={busy || disabled} />
        <Button
          type="button"
          variant="outline"
          disabled={busy || disabled}
          onClick={() => fileInput.current?.click()}
          className="text-xs"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          {formData.gallery_images ? 'Thay ảnh gallery' : 'Chọn ảnh gallery'}
        </Button>
        <Button
          type="button"
          disabled={busy || disabled || !formData.link.trim()}
          onClick={() => {
            attempted.current = formData.link.trim();
            analyze(formData.link.trim());
          }}
          className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {busy ? 'Đang phân tích & viết nội dung…' : (evidence ? 'AI phân tích lại' : 'AI điền thông tin')}
        </Button>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
        <input
          type="checkbox"
          checked={auto}
          onChange={event => setAuto(event.target.checked)}
          className="rounded border-slate-700 accent-primary"
        />
        Tự động phân tích khi đã dán link và ảnh gallery
      </label>

      {referral.referral_code && (
        <p className="text-xs text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1.5 rounded-md break-all font-mono">
          ✓ Đã nhận diện mã giới thiệu: <strong>{referral.referral_code}</strong> ({referral.referral_parameter})
        </p>
      )}

      {duplicate && (
        <div role="alert" className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 p-3 rounded-lg space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-semibold text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Phát hiện tool có thể đã tồn tại:</span>
            </div>
            {onSwitchToEdit && !editing && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onSwitchToEdit(duplicate.tool)}
                className="h-6 text-[11px] px-2 border-amber-500/40 text-amber-300 hover:text-white hover:bg-amber-500/20 shrink-0 font-medium"
              >
                Mở sửa tool này
              </Button>
            )}
          </div>
          <div className="text-[11px] text-slate-300 space-y-1 pl-6">
            <p>
              Tên: <strong className="text-white">{duplicate.tool.name}</strong> (ID #{duplicate.tool.id})
            </p>
            <p className="text-slate-400">
              {duplicate.message}
            </p>
            {(duplicate.tool.link || duplicate.tool.website_url) && (
              <a
                href={duplicate.tool.link || duplicate.tool.website_url}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline text-[10px] inline-flex items-center gap-1 mt-0.5"
              >
                Xem link gốc đã lưu <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-md flex items-center justify-between gap-2">
          <span>{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const link = formData.link.trim();
              if (link) analyze(link);
            }}
            disabled={busy || disabled}
            className="h-7 px-2 text-xs text-rose-300 hover:text-white hover:bg-rose-500/20 shrink-0 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {evidence && (
        <div className="text-xs rounded-lg bg-slate-900/90 border border-emerald-500/30 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Đã điền bản nháp thành công! Hãy kiểm tra lại bên dưới:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-800">
            <div><span className="text-slate-500">Tên:</span> <strong>{evidence.draft?.name}</strong></div>
            <div><span className="text-slate-500">Giá:</span> <strong>{evidence.draft?.pricing_type}</strong></div>
            <div className="sm:col-span-2 truncate"><span className="text-slate-500">Danh mục:</span> {evidence.draft?.categories?.join(', ')}</div>
            <div className="sm:col-span-2 text-slate-400 italic line-clamp-2">"{evidence.draft?.tagline}"</div>
          </div>
          {evidence.sources?.length > 0 && (
            <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-500 space-y-0.5">
              <span>Nguồn website đã tham khảo:</span>
              {evidence.sources.map(source => (
                <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block text-primary/70 hover:underline truncate">
                  • {source.title} ({source.url})
                </a>
              ))}
            </div>
          )}
          {evidence.warnings?.map(warning => (
            <p key={warning} className="text-amber-300 text-[11px]">{warning}</p>
          ))}
        </div>
      )}
    </section>
  );
}
