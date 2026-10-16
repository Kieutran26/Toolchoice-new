import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowUpRight, BrainCircuit, Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const DISMISS_KEY = 'marchoice_popup_dismissed_until';
const HOUR = 60 * 60 * 1000;
const PUBLIC_PATH = /^\/(?:$|pricing\/[^/]+\/?$|category\/[^/]+(?:\/[^/]+)?\/?$|deals\/?$)/;

export const openMarChoiceModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-marchoice-modal'));
  }
};

export default function MarChoiceModal() {
  const { pathname } = useLocation();
  const isPublicPage = PUBLIC_PATH.test(pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [dismissForDay, setDismissForDay] = useState(false);

  useEffect(() => {
    if (!isPublicPage) return;
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-marchoice-modal', handleOpen);

    let dismissedUntil = 0;
    try {
      dismissedUntil = Number(localStorage.getItem(DISMISS_KEY)) || 0;
    } catch {
      // The introduction remains available when browser storage is blocked.
    }
    const timer = dismissedUntil <= Date.now()
      ? window.setTimeout(handleOpen, 1200)
      : undefined;

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('open-marchoice-modal', handleOpen);
    };
  }, [isPublicPage]);

  useEffect(() => {
    if (!isPublicPage) setIsOpen(false);
  }, [isPublicPage]);

  const dismiss = (hours = dismissForDay ? 24 : 4) => {
    setIsOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + hours * HOUR));
    } catch {
      // Dismissal still works without persistent storage.
    }
  };

  return (
    <Dialog.Root open={isPublicPage && isOpen} onOpenChange={(open) => {
      if (open) setIsOpen(true);
      else dismiss();
    }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card text-card-foreground shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 motion-reduce:animate-none">
          <div className="flex items-center justify-between gap-3 border-b border-border px-6 py-3">
            <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-primary">
              <Sparkles aria-hidden="true" className="h-4 w-4 shrink-0" />
              HỆ SINH THÁI NEXTHOICE
            </span>
            <Dialog.Close aria-label="Đóng giới thiệu Marchoice" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X aria-hidden="true" className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BrainCircuit aria-hidden="true" className="h-7 w-7" />
              </div>
              <div>
                <Dialog.Title className="text-2xl font-bold tracking-tight">Marchoice</Dialog.Title>
                <p className="mt-0.5 text-sm text-muted-foreground">marchoice.site</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-2xl font-semibold leading-snug sm:text-3xl">
                Học và làm cùng AI dành riêng cho dân Marketer
              </p>
              <Dialog.Description className="text-sm leading-relaxed text-muted-foreground">
                Khám phá Marchoice — website dành cho Marketer trong hệ sinh thái Nexthoice.
                Cùng đưa AI vào việc học và công việc Marketing mỗi ngày.
              </Dialog.Description>
            </div>

            <a href="https://marchoice.site" target="_blank" rel="noopener noreferrer" onClick={() => dismiss(24)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card">
              Khám phá Marchoice
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              <span className="sr-only">(mở trong tab mới)</span>
            </a>

            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <label className="flex min-h-11 cursor-pointer items-center gap-2">
                <input type="checkbox" checked={dismissForDay} onChange={(event) => setDismissForDay(event.target.checked)} className="h-4 w-4 accent-primary" />
                Không nhắc lại trong 24 giờ
              </label>
              <Dialog.Close className="min-h-11 rounded px-2 underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Để sau</Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
