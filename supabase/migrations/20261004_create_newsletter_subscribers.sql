-- Migration: Create newsletter_subscribers table
-- Bảng lưu trữ email người dùng đăng ký nhận 8 công cụ mới hàng tuần

create table if not exists public.newsletter_subscribers (
    id uuid primary key default gen_random_uuid(),
    email text not null,
    status text not null default 'active', -- 'active' | 'unsubscribed'
    source text default 'website',
    created_at timestamptz not null default timezone('utc'::text, now()),
    updated_at timestamptz not null default timezone('utc'::text, now()),
    constraint newsletter_subscribers_email_key unique (email)
);

-- Index tìm kiếm email nhanh
create index if not exists idx_newsletter_subscribers_email on public.newsletter_subscribers (email);
create index if not exists idx_newsletter_subscribers_status on public.newsletter_subscribers (status);

-- Bật Row Level Security (RLS) để bảo vệ danh sách email
alter table public.newsletter_subscribers enable row level security;

-- 1. Cho phép bất kỳ ai (kể cả khách vãng lai anon) được đăng ký email mới
create policy "Allow public insert newsletter_subscribers"
    on public.newsletter_subscribers
    for insert
    to anon, authenticated
    with check (true);

-- 2. Chỉ tài khoản quản trị / authenticated mới được xem danh sách email (chống lộ email người dùng)
create policy "Allow authenticated view newsletter_subscribers"
    on public.newsletter_subscribers
    for select
    to authenticated
    using (true);

comment on table public.newsletter_subscribers is 'Bảng lưu trữ danh sách email đăng ký nhận bản tin 8 tool mới mỗi tuần';
