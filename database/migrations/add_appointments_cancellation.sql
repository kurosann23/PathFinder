-- Migration: Add cancellation support to appointments table
-- This migration adds the 'cancelled' status and cancellation_reason column
-- to allow both students and teachers to cancel approved appointments
-- with a mandatory reason

-- ============================================
-- STEP 1: Add cancellation_reason column
-- ============================================
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT NULL;

-- ============================================
-- STEP 2: Update status check constraint to include 'cancelled'
-- ============================================
-- Drop the existing check constraint
ALTER TABLE public.appointments
DROP CONSTRAINT IF EXISTS appointments_status_check;

-- Add new constraint with 'cancelled' status
ALTER TABLE public.appointments
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- ============================================
-- STEP 3: Update RLS policies for cancellation
-- ============================================

-- Students can cancel their own approved appointments
CREATE POLICY IF NOT EXISTS "appointments_update_student_cancel_approved"
ON public.appointments FOR UPDATE
USING (
  student_id = auth.uid()
  AND status = 'approved'  -- Can only cancel if currently approved
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid()
  AND status = 'cancelled'  -- Can only set to cancelled
  AND cancellation_reason IS NOT NULL
  AND cancellation_reason != ''
);

-- Teachers can cancel appointments assigned to them
CREATE POLICY IF NOT EXISTS "appointments_update_teacher_cancel_approved"
ON public.appointments FOR UPDATE
USING (
  teacher_id = auth.uid()
  AND status = 'approved'  -- Can only cancel if currently approved
  AND EXISTS (
    SELECT 1 FROM public.teacher_profiles
    WHERE teacher_profiles.id = auth.uid()
  )
)
WITH CHECK (
  teacher_id = auth.uid()
  AND status = 'cancelled'  -- Can only set to cancelled
  AND cancellation_reason IS NOT NULL
  AND cancellation_reason != ''
);

-- ============================================
-- NOTES:
-- ============================================
-- 1. Only approved appointments can be cancelled
-- 2. Both students and teachers can cancel approved appointments
-- 3. Cancellation requires a mandatory reason
-- 4. Status changes from 'approved' to 'cancelled'
-- 5. cancellation_reason must be provided and cannot be empty
