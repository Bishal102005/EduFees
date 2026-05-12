-- Run this once in Supabase SQL Editor if your batches table already exists.
ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS start_month TEXT NOT NULL DEFAULT 'January';

ALTER TABLE public.batches
ADD COLUMN IF NOT EXISTS start_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW());