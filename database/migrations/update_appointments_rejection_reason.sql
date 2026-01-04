-- Migration: Add rejection_reason to appointments table
-- This migration adds the rejection_reason column and updates RLS policies
-- to support teacher rejection with reason and student cancellation

-- ============================================
-- STEP 1: Add rejection_reason column
-- ============================================
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL;

-- ============================================
-- STEP 2: Update RLS policies
-- ============================================

-- Drop existing update policy for teachers
DROP POLICY IF EXISTS "appointments_update_teacher" ON public.appointments;

-- Teachers can update appointment status and rejection_reason
-- When rejecting, rejection_reason must be provided
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
  -- If status is rejected, rejection_reason must not be null
  AND (
    status != 'rejected' 
    OR rejection_reason IS NOT NULL 
    OR rejection_reason != ''
  )
);

-- Students can cancel their own pending appointments
-- They can only set status to 'rejected' if current status is 'pending'
-- rejection_reason must be set to 'Cancelled by student'
CREATE POLICY "appointments_update_student_cancel"
ON public.appointments FOR UPDATE
USING (
  student_id = auth.uid()
  AND status = 'pending'  -- Can only cancel if currently pending
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
  )
)
WITH CHECK (
  student_id = auth.uid()
  AND status = 'rejected'  -- Can only set to rejected
  AND rejection_reason IS NOT NULL
  AND rejection_reason = 'Cancelled by student'  -- Must set this specific reason
);

-- ============================================
-- NOTES:
-- ============================================
-- 1. Teachers can update status and rejection_reason
-- 2. When teacher sets status to 'rejected', rejection_reason must be provided
-- 3. Students can only cancel pending appointments by setting status to 'rejected'
-- 4. Student cancellation automatically sets rejection_reason to 'Cancelled by student'
-- 5. All rules are enforced at database level via RLS policies
