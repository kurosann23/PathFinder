-- Migration: Separate Student and Teacher Profiles
-- This migration creates separate tables for student_profiles and teacher_profiles
-- Run this after you have existing data in the profiles table (if any)

-- ============================================
-- STEP 1: Create student_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  class TEXT,
  email TEXT,
  avatar_url TEXT,
  about_me TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  interests JSONB DEFAULT '[]'::jsonb,
  hobbies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STEP 2: Create teacher_profiles table
-- ============================================
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: RLS Policies for student_profiles
-- ============================================
-- Students can read/update their own profile
CREATE POLICY "student_profiles_select_own"
ON public.student_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "student_profiles_insert_own"
ON public.student_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "student_profiles_update_own"
ON public.student_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 5: RLS Policies for teacher_profiles
-- ============================================
-- Teachers can read/update their own profile
CREATE POLICY "teacher_profiles_select_own"
ON public.teacher_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "teacher_profiles_insert_own"
ON public.teacher_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "teacher_profiles_update_own"
ON public.teacher_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- STEP 6: Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(email);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_email ON public.teacher_profiles(email);

-- ============================================
-- STEP 7: Migration helper function (optional)
-- Migrate existing data from profiles table if it exists
-- ============================================
-- NOTE: Only run this if you have existing data in the profiles table
-- Uncomment and run separately if needed:

/*
DO $$
DECLARE
  profile_record RECORD;
  user_role TEXT;
BEGIN
  -- Check if old profiles table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    -- Loop through existing profiles
    FOR profile_record IN SELECT * FROM public.profiles LOOP
      -- Determine role (default to 'student' if not set)
      user_role := COALESCE(profile_record.role, 'student');
      
      IF user_role = 'teacher' THEN
        -- Insert into teacher_profiles
        INSERT INTO public.teacher_profiles (
          id, full_name, email, avatar_url, created_at
        ) VALUES (
          profile_record.id,
          profile_record.full_name,
          profile_record.email,
          profile_record.avatar_url,
          COALESCE(profile_record.created_at, now())
        )
        ON CONFLICT (id) DO NOTHING;
      ELSE
        -- Insert into student_profiles
        INSERT INTO public.student_profiles (
          id, full_name, class, email, avatar_url, about_me, 
          skills, interests, hobbies, created_at
        ) VALUES (
          profile_record.id,
          profile_record.full_name,
          profile_record.class,
          profile_record.email,
          profile_record.avatar_url,
          profile_record.about_me,
          COALESCE(profile_record.skills, '[]'::jsonb),
          COALESCE(profile_record.interests, '[]'::jsonb),
          COALESCE(profile_record.hobbies, '[]'::jsonb),
          COALESCE(profile_record.created_at, now())
        )
        ON CONFLICT (id) DO NOTHING;
      END IF;
    END LOOP;
    
    RAISE NOTICE 'Migration completed. You can now drop the old profiles table if desired.';
  ELSE
    RAISE NOTICE 'No existing profiles table found. Skipping migration.';
  END IF;
END $$;
*/

-- ============================================
-- STEP 8: Update existing RLS policies that reference profiles.role
-- ============================================
-- Note: If you have existing policies that check profiles.role (like in courses/questions),
-- you'll need to update them. For now, we'll keep a minimal profiles table with just role
-- OR update those policies to check both tables.

-- Option A: Keep a minimal profiles table with just id and role for role checks
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- This allows teachers to read profiles for role checks in other policies
CREATE POLICY "profiles_select_for_role_check"
ON public.profiles FOR SELECT
USING (true); -- Allow authenticated users to check roles
