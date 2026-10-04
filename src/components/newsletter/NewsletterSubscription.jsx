import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { subscribeNewsletter } from '@/api/newsletterClient';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

export default function NewsletterSubscription({ 
  source = 'sidebar', 
  variant = 'sidebar', // 'sidebar' | 'banner' | 'card'
  className = '' 
}) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast({
        title: "Vui lòng nhập email",
        description: "Bạn cần điền địa chỉ email để nhận bản tin 8 tool mới.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await subscribeNewsletter(email, source);
      setIsSuccess(true);
      toast({
        title: res.alreadySubscribed ? "Email đã được đăng ký" : "Đăng ký thành công! 🎉",
        description: res.message,
      });
    } catch (err) {
      toast({
        title: "Không thể đăng ký",
        description: err.message || "Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compact inline variant for CommandSidebar (does not cause scroll)
  if (variant === 'sidebar') {
    return (
      <div className={cn(
        "p-2 rounded-lg border border-border/70 bg-secondary/25 relative overflow-hidden transition-all",
        className
      )}>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground font-mono">
            <Sparkles className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span>Cập nhật tool mới</span>
          </div>
          <span className="text-[9px] font-mono text-muted-foreground/60">Mỗi tuần</span>
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-1.5 p-1 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">Đã đăng ký nhận tin!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email của bạn..."
              required
              disabled={isLoading}
              className="w-full pl-2.5 pr-8 py-1 rounded text-[11px] font-mono bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground placeholder:text-muted-foreground/45 disabled:opacity-60 h-7"
            />
            <button
              type="submit"
              disabled={isLoading}
              title="Đăng ký nhận tool mới"
              className="absolute right-0.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded flex items-center justify-center bg-primary text-primary-foreground hover:opacity-90 active:scale-95 transition disabled:opacity-60 shadow-xs"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <ArrowRight className="w-3 h-3" />
              )}
            </button>
          </form>
        )}
      </div>
    );
  }

  // Full-width banner variant (for Home / Category footer or top banner)
  return (
    <div className={cn(
      "relative rounded-xl border border-border bg-gradient-to-br from-card/80 to-secondary/30 p-5 lg:p-6 overflow-hidden shadow-sm",
      className
    )}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-primary/10 text-primary mb-2">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>TỰ ĐỘNG CẬP NHẬT MỖI TUẦN</span>
          </div>
          <h3 className="text-lg font-bold text-foreground tracking-tight">
            Đừng bỏ lỡ các công cụ AI mới nhất
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Mỗi sáng thứ Hai, hệ thống tự động tổng hợp những công cụ hữu ích nhất gửi đến hòm thư của bạn.
          </p>
        </div>

        {isSuccess ? (
          <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Đã đăng ký thành công! Bạn sẽ nhận được bản tin vào thứ Hai tới.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:min-w-[320px]">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                required
                disabled={isLoading}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-mono bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-foreground placeholder:text-muted-foreground/50 disabled:opacity-60"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-semibold bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] transition whitespace-nowrap disabled:opacity-60 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <span>Đăng ký nhận tin</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
