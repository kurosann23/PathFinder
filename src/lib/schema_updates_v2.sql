-- Add skills column to courses table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'skills') THEN
        ALTER TABLE public.courses ADD COLUMN skills TEXT[] DEFAULT '{}'::TEXT[];
    END IF;
END $$;
