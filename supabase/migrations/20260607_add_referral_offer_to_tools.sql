-- Adds a column to store the referral/incentive text shown as a highlighted
-- yellow badge on the tool detail view (e.g. "Bấm vào link để nhận ngay 100 credit").
-- Each tool can have its own custom text; leave NULL/empty to hide the badge.

alter table public.tools
  add column if not exists referral_offer text;

comment on column public.tools.referral_offer is
  'Nội dung ưu đãi giới thiệu hiển thị dưới dạng badge vàng nổi bật trên trang chi tiết tool, vd: "Bấm vào link để nhận ngay 100 credit". Để trống nếu tool không có ưu đãi.';
