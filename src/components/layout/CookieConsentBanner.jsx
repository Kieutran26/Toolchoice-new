import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'toolchoice_privacy_notice_v2';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        setVisible(true);
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  const handleAccept = (mode = 'acknowledged') => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Ignore storage error
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Thông báo sử dụng Cookie và Dữ liệu"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90 p-3 sm:p-4 shadow-lg"
    >
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <p>
            <strong className="text-foreground">Thông báo về Cookie & Quyền riêng tư:</strong> Toolchoice sử dụng bộ nhớ trình duyệt, cookie và dịch vụ đối tác bên thứ ba (bao gồm Google AdSense và công cụ đo lường hiệu năng) để ghi nhớ tùy chọn giao diện, phân tích lưu lượng truy cập và hiển thị quảng cáo phù hợp. Bạn có thể tìm hiểu cách dữ liệu được xử lý trong{' '}
            <a href="/privacy.html" className="underline text-foreground hover:text-primary font-medium">
              Chính sách quyền riêng tư
            </a>{' '}
            và{' '}
            <a href="/terms.html" className="underline text-foreground hover:text-primary font-medium">
              Điều khoản sử dụng
            </a>{' '}
            của chúng tôi.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <a
            href="/privacy.html"
            className="text-xs px-2.5 py-1.5 rounded border border-border hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            Tìm hiểu thêm
          </a>
          <Button
            size="sm"
            onClick={() => handleAccept('acknowledged')}
            className="h-8 px-3 text-xs font-mono tracking-wider custom-primary-button"
          >
            ĐÃ HIỂU
          </Button>
          <button
            onClick={() => handleAccept('dismissed')}
            aria-label="Đóng thông báo"
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
