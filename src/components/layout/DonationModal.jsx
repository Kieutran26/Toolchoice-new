import React, { useState } from 'react';
import { X, Copy, Check, CreditCard, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonationModal({ isOpen, onClose }) {
  const [copiedField, setCopiedField] = useState(null);

  const bankInfo = {
    accountName: 'TRAN THI KIEU TRAN',
    accountNumber: '123456789',
    bankName: 'Techcombank (TCB)',
    description: 'Neural Index Donate',
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="w-full max-w-sm bg-card border border-border rounded-lg shadow-xl overflow-hidden pointer-events-auto flex flex-col font-mono"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/30">
                <span className="text-[10px] font-bold text-primary tracking-[0.15em] flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-current text-primary animate-pulse" />
                  ỦNG HỘ DỰ ÁN
                </span>
                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {/* Simulated QR Code Card */}
                <div className="relative p-4 rounded-lg bg-white border border-slate-200 shadow-inner flex flex-col items-center">
                  <div className="text-[10px] font-semibold text-slate-800 tracking-wider mb-3">
                    QUÉT MÃ QR ĐỂ CHUYỂN KHOẢN
                  </div>
                  
                  {/* Decorative corner brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/40 rounded-tl-sm" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/40 rounded-tr-sm" />
                  <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/40 rounded-bl-sm" />
                  <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/40 rounded-br-sm" />

                  {/* QR SVG */}
                  <div className="text-primary w-40 h-40 flex items-center justify-center bg-white">
                    <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="5" y="5" width="22" height="22" rx="2" stroke="currentColor" strokeWidth="4" />
                      <rect x="10" y="10" width="12" height="12" rx="1" fill="currentColor" />
                      
                      <rect x="73" y="5" width="22" height="22" rx="2" stroke="currentColor" strokeWidth="4" />
                      <rect x="78" y="10" width="12" height="12" rx="1" fill="currentColor" />
                      
                      <rect x="5" y="73" width="22" height="22" rx="2" stroke="currentColor" strokeWidth="4" />
                      <rect x="10" y="78" width="12" height="12" rx="1" fill="currentColor" />

                      <rect x="78" y="78" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2" />
                      <rect x="81" y="81" width="2" height="2" fill="currentColor" />

                      <path d="M 33,5 H 45 M 50,5 H 65 M 33,15 H 40 M 55,15 H 60 M 33,25 H 50 M 55,25 H 65" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 5,33 V 45 M 15,33 V 50 M 25,33 V 40 M 5,55 V 65 M 25,55 V 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 33,33 H 45 V 50 H 33 Z M 55,33 H 65 M 55,45 H 60 M 70,33 H 85 M 70,45 H 75 M 85,45 H 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 33,55 H 60 M 33,65 H 45 M 50,65 H 65 M 70,55 H 95 M 70,65 H 80 M 85,65 H 95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <path d="M 33,75 H 45 M 55,75 H 60 M 70,75 H 95 M 33,85 H 50 M 55,85 H 65 M 70,85 H 95 M 33,95 H 65 M 70,95 H 85" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* Bank Details Container */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-bold text-muted-foreground/60 tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3 h-3" />
                    THÔNG TIN CHUYỂN KHOẢN
                  </div>
                  
                  <div className="space-y-1.5 rounded border border-border bg-secondary/20 p-3 text-xs leading-relaxed text-foreground/90">
                    {/* Bank Name */}
                    <div>
                      <span className="text-muted-foreground">Ngân hàng: </span>
                      <span className="font-semibold">{bankInfo.bankName}</span>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground">Số TK: </span>
                        <span className="font-semibold text-primary">{bankInfo.accountNumber}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === 'accountNumber' ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Account Name */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground">Chủ TK: </span>
                        <span className="font-semibold">{bankInfo.accountName}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankInfo.accountName, 'accountName')}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Sao chép tên tài khoản"
                      >
                        {copiedField === 'accountName' ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-muted-foreground">Nội dung: </span>
                        <span className="font-semibold">{bankInfo.description}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(bankInfo.description, 'description')}
                        className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                        title="Sao chép nội dung"
                      >
                        {copiedField === 'description' ? (
                          <Check className="w-3.5 h-3.5 text-primary" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border px-4 py-3 bg-secondary/35 text-center">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Mọi sự ủng hộ dù nhỏ bé đều giúp mình có thêm động lực để duy trì web và giúp web tốt hơn. Cảm ơn bạn vì sự đồng hành này.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
