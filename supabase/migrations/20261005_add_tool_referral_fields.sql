-- Referral identifiers are distinct from discount/promotion codes.
ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS referral_code text;
ALTER TABLE public.tools ADD COLUMN IF NOT EXISTS referral_parameter text;
