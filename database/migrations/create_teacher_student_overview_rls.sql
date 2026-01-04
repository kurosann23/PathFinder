-- Migration: Teacher Student Overview RLS Policies
-- This migration allows teachers to view student profiles and RIASEC results
-- for the Student Overview feature (counselling purposes only)
--
-- IMPORTANT: These policies only allow READ access. Teachers cannot modify student data.

-- ============================================
-- STEP 1: Allow teachers to read student profiles
-- ============================================
-- Teachers need to read student profiles to view class information and names
-- This policy checks if the current user is a teacher by checking teacher_profiles table

CREATE POLICY IF NOT EXISTS "profiles_select_for_teachers"
ON public.profiles FOR SELECT
USING (
  -- Check if current user is a teacher
  EXISTS (
    SELECT 1
    FROM public.teacher_profiles
    WHERE teacher_profiles.id = auth.uid()
  )
);

-- ============================================
-- STEP 2: Allow teachers to read psychometric results
-- ============================================
-- Teachers need to read RIASEC results to view student dominant codes
-- This policy checks if the current user is a teacher

CREATE POLICY IF NOT EXISTS "psychometric_results_select_for_teachers"
ON public.psychometric_results FOR SELECT
USING (
  -- Check if current user is a teacher
  EXISTS (
    SELECT 1
    FROM public.teacher_profiles
    WHERE teacher_profiles.id = auth.uid()
  )
);

-- ============================================
-- NOTES:
-- ============================================
-- 1. These policies only grant SELECT (read) access
-- 2. Teachers cannot INSERT, UPDATE, or DELETE student data
-- 3. The policies check teacher_profiles table to verify teacher role
-- 4. Students can still only see their own data (existing policies remain)
-- 5. If you need to revoke access, drop these policies:
--    DROP POLICY IF EXISTS "profiles_select_for_teachers" ON public.profiles;
--    DROP POLICY IF EXISTS "psychometric_results_select_for_teachers" ON public.psychometric_results;
