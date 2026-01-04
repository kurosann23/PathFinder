-- Migration: Add meeting instruction fields to appointments table
-- This migration adds meeting_link, meeting_place, and meeting_note columns
-- to support post-approval communication with clear, separate fields
-- Teachers can add meeting instructions when approving appointments
-- Students can view these instructions for approved appointments

-- ============================================
-- STEP 1: Add meeting instruction columns
-- ============================================
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_link TEXT NULL;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_place TEXT NULL;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS meeting_note TEXT NULL;

-- ============================================
-- NOTES:
-- ============================================
-- 1. meeting_link: For online meetings (e.g., Zoom, Google Meet links)
-- 2. meeting_place: For face-to-face or online location details
-- 3. meeting_note: Optional additional notes/instructions
-- 4. All fields are nullable - teachers can optionally fill based on appointment mode
-- 5. This is for one-way communication: teacher -> student
-- 6. No chat system - just simple instruction fields
-- 7. Students can view but cannot edit or reply
