import React from 'react';
import { ClipboardPaste } from 'lucide-react';
import { pasteImage } from '@/lib/clipboard-image';

export default function ImagePasteTarget({ label, onImage, disabled }) {
  return <button type="button" disabled={disabled}
    onPaste={event => pasteImage(event, onImage, disabled)}
    aria-label={`Dán ${label}: bấm vào đây rồi nhấn Ctrl+V hoặc Command+V`}
    title="Copy ảnh, bấm vào đây rồi nhấn Ctrl+V (Mac: Command+V)"
    className="inline-flex items-center gap-1 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
    <ClipboardPaste className="w-3 h-3" />Dán ảnh · Ctrl+V
  </button>;
}
