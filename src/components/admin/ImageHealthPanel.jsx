import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, ImageOff, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminJson, adminRequest, uploadAdminImage } from '@/api/adminClient';
import { auditImages } from '@/lib/image-audit';
import ImagePasteTarget from './ImagePasteTarget';

export default function ImageHealthPanel({ onRepaired, onEditTool }) {
  const [progress, setProgress] = useState({ completed: 0, total: 0, results: [] });
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [lastScan, setLastScan] = useState('');
  const [repairing, setRepairing] = useState('');
  const [filter, setFilter] = useState('issues');
  const controller = useRef(null);
  const rowKey = item => `${item.table}:${item.id}:${item.field}:${item.index || 0}`;
  const scan = useCallback(async () => {
    controller.current?.abort();
    const active = new AbortController();
    controller.current = active;
    setRunning(true); setError(''); setProgress({ completed: 0, total: 0, results: [] });
    try {
      const { entries } = await adminRequest('/images', { signal: active.signal });
      await auditImages(entries, { signal: active.signal, onProgress: value => { if (!active.signal.aborted) setProgress(value); }, verifyFailure: (url, signal) => adminJson('/images/check', { url }, 'POST', signal) });
      if (!active.signal.aborted) setLastScan(new Date().toLocaleString('vi-VN'));
    } catch (err) { if (err.name !== 'AbortError') setError(err.message); }
    finally { if (controller.current === active) setRunning(false); }
  }, []);

  useEffect(() => {
    scan();
    return () => controller.current?.abort();
  }, [scan]);

  const repair = async (item, file) => {
    if (!file || repairing || running) return;
    setRepairing(rowKey(item)); setError('');
    try {
      const { url } = await uploadAdminImage(file);
      await adminJson('/images/replace', { table: item.table, id: item.id, field: item.field, index: item.index || 0, oldUrl: item.url, newUrl: url });
      setProgress(prev => ({ ...prev, results: prev.results.map(row => rowKey(row) === rowKey(item) ? { ...row, url, ok: true, state: 'valid', reason: 'Đã thay ảnh.' } : row) }));
      onRepaired();
    } catch (err) { setError(err.message); }
    finally { setRepairing(''); }
  };

  const issues = progress.results.filter(item => !item.ok);
  const visible = filter === 'all' ? progress.results : issues;
  return <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-5 space-y-4">
    <div className="flex flex-wrap gap-3 items-center justify-between"><div><h2 className="font-semibold flex gap-2 items-center"><ImageOff className="w-4 h-4 text-amber-400" />Kiểm tra ảnh toàn website</h2><p className="text-xs text-slate-400 mt-1">Tự quét khi vào admin: gallery, logo, ảnh bài viết và ưu đãi. Phát hiện cả ảnh trả 200 nhưng không hiển thị được.</p></div><div className="flex gap-2"><Button type="button" variant="outline" onClick={scan} disabled={running || Boolean(repairing)}><RefreshCw className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />Quét lại</Button>{running && <Button type="button" variant="outline" onClick={() => controller.current?.abort()}>Dừng</Button>}</div></div>
    <div className="flex flex-wrap gap-4 text-xs text-slate-300"><span>{running ? 'Đang kiểm tra' : 'Đã kiểm tra'} {progress.completed}/{progress.total} URL</span><span className={issues.length ? 'text-amber-300' : 'text-emerald-400'}>{issues.length} vị trí cần kiểm tra</span>{lastScan && <span>Lần quét hoàn tất: {lastScan}</span>}</div>
    <progress className="w-full h-2 accent-green-600" value={progress.completed} max={progress.total || 1} aria-label="Tiến độ kiểm tra ảnh" />
    {error && <p role="alert" className="text-xs text-rose-400">{error}</p>}
    <label className="text-xs text-slate-400">Hiển thị <select value={filter} onChange={event => setFilter(event.target.value)} className="bg-slate-900 border border-slate-700 rounded p-1 ml-2"><option value="issues">Ảnh cần kiểm tra</option><option value="all">Tất cả ảnh đã kiểm tra</option></select></label>
    {!running && !issues.length && progress.total > 0 && <p className="text-sm text-emerald-400">Các ảnh đã quét hiển thị được trong trình duyệt này.</p>}
    <div className="max-h-80 overflow-auto space-y-2">{visible.map(item => <div key={rowKey(item)} className="flex flex-wrap items-center justify-between gap-2 border border-slate-800 rounded-lg p-3 text-xs"><div className="min-w-0 flex-1"><strong>{item.name}</strong><span className="text-slate-400 ml-2">{item.label} · {item.table}</span><p className={item.ok ? 'text-emerald-400' : 'text-amber-300'}>{item.reason || 'Ảnh hiển thị được'}</p>{item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="block truncate text-slate-500 underline max-w-xl">{item.url}</a>}</div>{item.table !== 'site' && <ImagePasteTarget label={item.label + ' của ' + item.name} onImage={file => repair(item, file)} disabled={Boolean(repairing) || running} />}{item.table !== 'site' && <label className={`inline-flex items-center gap-1 border border-slate-700 rounded px-2 py-1 cursor-pointer ${repairing || running ? 'opacity-50 pointer-events-none' : ''}`}>{repairing === rowKey(item) ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}Thay ảnh<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={Boolean(repairing) || running} aria-label={`Thay ${item.label} của ${item.name}`} onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; repair(item, file); }} /></label>}{item.table === 'tools' && <Button type="button" variant="ghost" size="sm" onClick={() => onEditTool(item.id)}>Sửa tool</Button>}</div>)}</div>
  </section>;
}
