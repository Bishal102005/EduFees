-- Schema for EduFees Database in Supabase

-- 1. Create Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    schedule TEXT NOT NULL,
    monthly_fee NUMERIC NOT NULL DEFAULT 0,
    start_month TEXT NOT NULL DEFAULT 'January',
    start_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If you already created the batches table earlier, run-safe column upgrades:
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS start_month TEXT NOT NULL DEFAULT 'January';
ALTER TABLE public.batches ADD COLUMN IF NOT EXISTS start_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM NOW());

-- 2. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    mobile TEXT NOT NULL UNIQUE,
    email TEXT,
    address TEXT,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    discount NUMERIC NOT NULL DEFAULT 0,
    final_fee NUMERIC NOT NULL DEFAULT 0,
    join_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS discount NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS final_fee NUMERIC NOT NULL DEFAULT 0;

-- 3. Create Fees Records Table
CREATE TABLE IF NOT EXISTS public.fees_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    month TEXT NOT NULL,
    year INTEGER NOT NULL,
    amount NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('paid', 'pending')),
    paid_date TIMESTAMPTZ,
    payment_method TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Enable Row Level Security (Optional: Disable if you want open API access or configure RLS rules)
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees_records ENABLE ROW LEVEL SECURITY;

-- 5. Create Simple Allow-All Policies for Development (Configure real Auth policies in production)
DROP POLICY IF EXISTS "Allow anonymous read on batches" ON public.batches;
DROP POLICY IF EXISTS "Allow anonymous write on batches" ON public.batches;
DROP POLICY IF EXISTS "Allow anonymous read on students" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous write on students" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous read on fees_records" ON public.fees_records;
DROP POLICY IF EXISTS "Allow anonymous write on fees_records" ON public.fees_records;

CREATE POLICY "Allow anonymous read on batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on batches" ON public.batches FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on students" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on fees_records" ON public.fees_records FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on fees_records" ON public.fees_records FOR ALL USING (true);

-- Indexes for performance Optimization
CREATE INDEX IF NOT EXISTS idx_students_mobile ON public.students(mobile);
CREATE INDEX IF NOT EXISTS idx_fees_records_student ON public.fees_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_records_period ON public.fees_records(month, year);
