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

-- 4. Create Student Batches (Junction Table for Multi-Batch Enrollments)
CREATE TABLE IF NOT EXISTS public.student_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    discount NUMERIC NOT NULL DEFAULT 0,
    final_fee NUMERIC NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(student_id, batch_id)
);

-- Backfill existing single-batch assignments safely into student_batches
INSERT INTO public.student_batches (student_id, batch_id, discount, final_fee)
SELECT id, batch_id, discount, final_fee 
FROM public.students 
WHERE batch_id IS NOT NULL
ON CONFLICT (student_id, batch_id) DO NOTHING;

-- 5. Enable Row Level Security
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees_records ENABLE ROW LEVEL SECURITY;

-- 6. Create Simple Allow-All Policies for Development
DROP POLICY IF EXISTS "Allow anonymous read on batches" ON public.batches;
DROP POLICY IF EXISTS "Allow anonymous write on batches" ON public.batches;
DROP POLICY IF EXISTS "Allow anonymous read on students" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous write on students" ON public.students;
DROP POLICY IF EXISTS "Allow anonymous read on student_batches" ON public.student_batches;
DROP POLICY IF EXISTS "Allow anonymous write on student_batches" ON public.student_batches;
DROP POLICY IF EXISTS "Allow anonymous read on fees_records" ON public.fees_records;
DROP POLICY IF EXISTS "Allow anonymous write on fees_records" ON public.fees_records;

CREATE POLICY "Allow anonymous read on batches" ON public.batches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on batches" ON public.batches FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on students" ON public.students FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on student_batches" ON public.student_batches FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on student_batches" ON public.student_batches FOR ALL USING (true);

CREATE POLICY "Allow anonymous read on fees_records" ON public.fees_records FOR SELECT USING (true);
CREATE POLICY "Allow anonymous write on fees_records" ON public.fees_records FOR ALL USING (true);

-- Indexes for performance Optimization
CREATE INDEX IF NOT EXISTS idx_students_mobile ON public.students(mobile);
CREATE INDEX IF NOT EXISTS idx_student_batches_student ON public.student_batches(student_id);
CREATE INDEX IF NOT EXISTS idx_student_batches_batch ON public.student_batches(batch_id);
CREATE INDEX IF NOT EXISTS idx_fees_records_student ON public.fees_records(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_records_period ON public.fees_records(month, year);

