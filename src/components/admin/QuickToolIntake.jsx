import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, Loader2, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminJson, uploadAdminImage } from '@/api/adminClient';
import { parseReferral } from '@/lib/tool-intake';
import { pasteImage } from '@/lib/clipboard-image';
import ImagePasteTarget from './ImagePasteTarget';

export default function QuickToolIntake({ formData, onChange, onDraft, onBusyChange, editing, disabled }) {
  const [auto, setAuto] = useState(!editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState(null);
  const controller = useRef(null);
  const attempted = useRef('');
  const fileInput = useRef(null);
  const latest = useRef(formData);
  latest.current = formData;
  const referral = parseReferral(formData.link);

  useEffect(() => () => controller.current?.abort(), []);

  const analyze = async link => {
    if (busy || disabled) return;
    setBusy(true); onBusyChange(true); setError(''); setEvidence(null);
    controller.current = new AbortController();
    try {
      const result = await adminJson('/analyze', { link }, 'POST', controller.current.signal);
      // A result for a previous URL must not overwrite the current form.
      if (latest.current.link.trim() === link) { onDraft(result.draft); setEvidence(result); }
    } catch (err) { if (err.name !== 'AbortError') setError(err.message); }
    finally { setBusy(false); onBusyChange(false); }
  };

  useEffect(() => {
    const link = formData.link.trim();
    if (!auto || busy || disabled || !formData.gallery_images || !/^https?:\/\//i.test(link) || attempted.current === link) return;
    const timer = setTimeout(() => { attempted.current = link; analyze(link); }, 900);
    return () => clearTimeout(timer);
    // Re-run only when intake inputs change, not when the generated draft arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.link, formData.gallery_images, auto, busy, disabled]);

  const upload = async file => {
    if (!file || busy || disabled) return;
    setBusy(true); onBusyChange(true); setError('');
    try { const result = await uploadAdminImage(file); onChange({ target: { name: 'gallery_images', value: result.url } }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); onBusyChange(false); }
  };

  return (
    <section onPaste={event => pasteImage(event, upload, busy || disabled)} className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
      <h4 className="font-semibold flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" />Thêm tool bằng link và ảnh</h4>
      <p className="text-xs text-slate-400">AI đọc website và điền bản nháp. Kiểm tra nội dung bên dưới trước khi lưu.</p>
      <label className="block text-xs text-slate-300" htmlFor="intake-link">Link website (giữ nguyên link giới thiệu)</label>
      <Input disabled={disabled} id="intake-link" value={formData.link} onChange={event => onChange({ target: { name: 'link', value: event.target.value } })} placeholder="https://website.com/?ref=your-code" className="bg-slate-900 border-slate-700" />
      <div className="flex flex-wrap gap-2">
        <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; upload(file); }} className="hidden" aria-label="Chọn ảnh gallery" />
        <ImagePasteTarget label="ảnh gallery" onImage={upload} disabled={busy || disabled} />
        <Button type="button" variant="outline" disabled={busy || disabled} onClick={() => fileInput.current?.click()}><Upload className="w-4 h-4 mr-2" />{formData.gallery_images ? 'Thay ảnh gallery' : 'Chọn ảnh gallery'}</Button>
        <Button type="button" disabled={busy || disabled || !formData.link.trim()} onClick={() => { attempted.current = formData.link.trim(); analyze(formData.link.trim()); }}>{busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}{busy ? 'Đang xử lý…' : 'AI điền thông tin'}</Button>
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={auto} onChange={event => setAuto(event.target.checked)} />Tự phân tích khi đã nhập link và ảnh</label>
      {referral.referral_code && <p className="text-xs text-amber-300 break-all">Đã nhận diện mã giới thiệu: {referral.referral_code} ({referral.referral_parameter}).</p>}
      {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
      {evidence && <div className="text-xs space-y-1 text-slate-400"><p className="text-emerald-400">Đã điền bản nháp. Nguồn AI đã đọc:</p>{evidence.sources.map(source => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="block underline truncate">{source.title}</a>)}{evidence.warnings.map(warning => <p key={warning} className="text-amber-300">{warning}</p>)}</div>}
    </section>
  );
}
