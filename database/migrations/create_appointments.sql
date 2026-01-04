-- Migration: Appointments Table
-- This migration creates the appointments table for student-teacher appointment booking
-- Students can request appointments, teachers can approve/reject them

-- ============================================
-- STEP 1: Create appointments table
-- ============================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'face-to-face')),
  date DATE NOT NULL,
  time TIME NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_appointments_student_id ON public.appointments(student_id);
CREATE INDEX IF NOT EXISTS idx_appointments_teacher_id ON public.appointments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies
-- ============================================

-- Students can view their own appointments
CREATE POLICY "appointments_select_student_own"
ON public.appointments FOR SELECT
USING (
  student_id = auth.uid()
);

-- Students can create appointments (only for themselves)
CREATE POLICY "appointments_insert_student"
ON public.appointments FOR INSERT
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Teachers can view appointments assigned to them
CREATE POLICY "appointments_select_teacher_own"
ON public.appointments FOR SELECT
USING (
  teacher_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.teacher_profiles
    WHERE teacher_profiles.id = auth.uid()
  )
);

-- Teachers can update appointment status (approve/reject)
CREATE POLICY "appointments_update_teacher"
ON public.appointments FOR UPDATE
USING (
  teacher_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.teacher_profiles
    WHERE teacher_profiles.id = auth.uid()
  )
)
WITH CHECK (
  teacher_id = auth.uid()
  AND status IN ('approved', 'rejected', 'pending')
);

-- ============================================
-- STEP 5: Allow students to read teacher profiles (for dropdown)
-- ============================================
-- Students need to see available teachers to book appointments
CREATE POLICY IF NOT EXISTS "teacher_profiles_select_for_students"
ON public.teacher_profiles FOR SELECT
USING (
  -- Check if current user is a student
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
);

-- ============================================
-- STEP 6: Create trigger to update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION update_appointments_updated_at();
