-- Migration: Add course_image_url to courses table
-- This migration adds the course_image_url column to support optional course images
-- Images are stored in Supabase Storage and URLs are saved in the database

-- ============================================
-- STEP 1: Add course_image_url column
-- ============================================
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS course_image_url TEXT NULL;

-- ============================================
-- NOTES:
-- ============================================
-- 1. course_image_url is nullable - images are optional
-- 2. Images should be stored in Supabase Storage
-- 3. URL should be the public URL from Supabase Storage
-- 4. No additional constraints needed - URL validation handled in application layer
