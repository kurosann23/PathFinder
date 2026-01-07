-- Add new columns for "What You'll Work On" section
DO $$
BEGIN
    -- Real-world Projects
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'work_projects') THEN
        ALTER TABLE public.courses ADD COLUMN work_projects TEXT;
    END IF;

    -- Interactive Labs
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'work_labs') THEN
        ALTER TABLE public.courses ADD COLUMN work_labs TEXT;
    END IF;

    -- Team Collaboration
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'work_collaboration') THEN
        ALTER TABLE public.courses ADD COLUMN work_collaboration TEXT;
    END IF;

    -- Overview text (if not already present from previous updates)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'courses' AND column_name = 'what_you_will_work') THEN
        ALTER TABLE public.courses ADD COLUMN what_you_will_work TEXT;
    END IF;
END $$;
