-- Create psychometric_questions table for storing RIASEC test questions
-- This table supports CRUD operations for teachers

CREATE TABLE IF NOT EXISTS public.psychometric_questions (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('R', 'I', 'A', 'S', 'E', 'C')),
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_psychometric_questions_type ON public.psychometric_questions(type);
CREATE INDEX IF NOT EXISTS idx_psychometric_questions_active ON public.psychometric_questions(is_active);
CREATE INDEX IF NOT EXISTS idx_psychometric_questions_order ON public.psychometric_questions(type, order_index);

-- Enable Row Level Security
ALTER TABLE public.psychometric_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can read active questions (for students taking the test)
CREATE POLICY "psychometric_questions_select_active"
ON public.psychometric_questions FOR SELECT
USING (is_active = true);

-- Only teachers can read all questions (including inactive)
CREATE POLICY "psychometric_questions_select_all_teachers"
ON public.psychometric_questions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
);

-- Only teachers can insert questions
CREATE POLICY "psychometric_questions_insert_teachers"
ON public.psychometric_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
);

-- Only teachers can update questions
CREATE POLICY "psychometric_questions_update_teachers"
ON public.psychometric_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
);

-- Only teachers can delete questions
CREATE POLICY "psychometric_questions_delete_teachers"
ON public.psychometric_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'teacher'
  )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_psychometric_questions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_psychometric_questions_updated_at
BEFORE UPDATE ON public.psychometric_questions
FOR EACH ROW
EXECUTE FUNCTION update_psychometric_questions_updated_at();

-- Insert initial questions (optional - can be done via UI)
-- This is a seed script that can be run to populate initial questions
-- You can comment this out if you prefer to add questions via the UI

-- REALISTIC (R) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I enjoy working with hardware, tools, or physical equipment.', 'R', 1, true),
('I prefer learning by doing rather than reading or listening only.', 'R', 2, true),
('I like fixing or assembling technical devices.', 'R', 3, true),
('I am comfortable working with machines or technical systems.', 'R', 4, true)
ON CONFLICT DO NOTHING;

-- INVESTIGATIVE (I) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I enjoy solving logical or technical problems.', 'I', 1, true),
('I like analysing data or finding patterns to solve issues.', 'I', 2, true),
('I enjoy learning how systems or technologies work internally.', 'I', 3, true),
('I prefer tasks that challenge my thinking and reasoning skills.', 'I', 4, true)
ON CONFLICT DO NOTHING;

-- ARTISTIC (A) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I enjoy designing visuals, layouts, or digital content.', 'A', 1, true),
('I like expressing ideas creatively using technology.', 'A', 2, true),
('I prefer open-ended tasks where I can explore my creativity.', 'A', 3, true),
('I enjoy combining creativity with technology, such as design or media.', 'A', 4, true)
ON CONFLICT DO NOTHING;

-- SOCIAL (S) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I enjoy helping others solve problems or understand technology.', 'S', 1, true),
('I like working in teams and collaborating with others.', 'S', 2, true),
('I am comfortable explaining technical concepts to others.', 'S', 3, true),
('I find satisfaction in supporting or guiding people.', 'S', 4, true)
ON CONFLICT DO NOTHING;

-- ENTERPRISING (E) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I enjoy leading projects or taking initiative in group work.', 'E', 1, true),
('I am interested in managing technology-based projects or teams.', 'E', 2, true),
('I like making decisions and influencing others.', 'E', 3, true),
('I am interested in using technology for business or entrepreneurship.', 'E', 4, true)
ON CONFLICT DO NOTHING;

-- CONVENTIONAL (C) questions
INSERT INTO public.psychometric_questions (text, type, order_index, is_active) VALUES
('I prefer working with structured tasks and clear guidelines.', 'C', 1, true),
('I enjoy organizing information, data, or digital records.', 'C', 2, true),
('I am comfortable following procedures and systematic processes.', 'C', 3, true),
('I prefer tasks that require accuracy, consistency, and attention to detail.', 'C', 4, true)
ON CONFLICT DO NOTHING;
