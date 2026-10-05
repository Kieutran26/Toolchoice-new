import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function ReferralFields({ value, onChange, disabled }) {
  const fields = [
    ['referral_code', 'Mã giới thiệu', 'Mã ref/affiliate/invite trong link'],
    ['referral_parameter', 'Loại tham số giới thiệu', 'ref, via, affiliate, path…'],
    ['promotion_code', 'Mã giảm giá', 'Chỉ điền mã coupon/promo có thật'],
    ['promotion_description', 'Thông tin ưu đãi', 'Điều kiện và quyền lợi được website xác nhận'],
  ];
  return <div className="space-y-3"><p className="text-xs text-slate-400">Mã giới thiệu được lưu riêng với mã giảm giá. Link gốc được giữ nguyên.</p>{fields.map(([name, label, placeholder]) => <div key={name} className="space-y-1"><label htmlFor={name} className="text-xs text-slate-300">{label}</label>{name === 'promotion_description' ? <Textarea id={name} name={name} value={value[name] || ''} onChange={onChange} disabled={disabled} placeholder={placeholder} className="bg-slate-900 border-slate-800" /> : <Input id={name} name={name} value={value[name] || ''} onChange={onChange} disabled={disabled} placeholder={placeholder} className="bg-slate-900 border-slate-800" />}</div>)}<label className="flex items-center gap-2 text-xs text-slate-300"><input name="has_promotion" type="checkbox" checked={Boolean(value.has_promotion)} onChange={onChange} disabled={disabled} />Hiển thị trong mục ưu đãi</label></div>;
}
