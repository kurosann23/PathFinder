# Database Setup

This directory contains database migrations for storing psychometric test questions and course recommendations in Supabase.

## Setup Instructions

### 1. Run the Migrations

Open your Supabase SQL Editor and run both migration files:

**For Psychometric Questions:**
- Go to Supabase Dashboard → SQL Editor
- Click "New Query"
- Copy the contents of `create_psychometric_questions.sql`
- Click "Run"

**For Courses:**
- Create a new query
- Copy the contents of `create_courses.sql`
- Click "Run"

### 2. Verify Table Creation

After running the migrations, verify the tables were created:

```sql
-- Check questions table
SELECT * FROM public.psychometric_questions LIMIT 5;

-- Check courses table
SELECT * FROM public.courses LIMIT 5;
```

### 3. Check RLS Policies

Both migrations include Row Level Security (RLS) policies:

**Psychometric Questions:**
- **Students**: Can read active questions only
- **Teachers**: Can read, create, update, and delete all questions

**Courses:**
- **Students**: Can read active courses only
- **Teachers**: Can read, create, update, and delete all courses

### 4. Initial Data

**Psychometric Questions:**
The migration includes seed data with 24 initial questions (4 per RIASEC type). If you want to start fresh:
```sql
DELETE FROM public.psychometric_questions;
```

**Courses:**
The migration includes seed data with 18 initial courses (3 per RIASEC type). If you want to start fresh:
```sql
DELETE FROM public.courses;
```

You can also manage both questions and courses via the Teacher Dashboard UI.

## Table Structures

### Psychometric Questions

```sql
psychometric_questions
├── id (SERIAL PRIMARY KEY)
├── text (TEXT NOT NULL)
├── type (TEXT CHECK: 'R', 'I', 'A', 'S', 'E', 'C')
├── order_index (INTEGER)
├── is_active (BOOLEAN DEFAULT true)
├── created_at (TIMESTAMPTZ DEFAULT now())
└── updated_at (TIMESTAMPTZ DEFAULT now())
```

### Courses

```sql
courses
├── id (SERIAL PRIMARY KEY)
├── riasec_type (TEXT CHECK: 'R', 'I', 'A', 'S', 'E', 'C')
├── course_name (TEXT NOT NULL)
├── focus_description (TEXT NOT NULL)
├── what_you_learn (JSONB) - Array of strings
├── tools_and_skills (JSONB) - Array of strings
├── example_job_roles (JSONB) - Array of {title, description}
├── order_index (INTEGER)
├── is_active (BOOLEAN DEFAULT true)
├── created_at (TIMESTAMPTZ DEFAULT now())
└── updated_at (TIMESTAMPTZ DEFAULT now())
```

## Features

- **Soft Delete**: Both questions and courses are marked as `is_active = false` instead of being permanently deleted
- **Auto Timestamps**: `created_at` and `updated_at` are automatically managed
- **Ordering**: Both can be ordered within each RIASEC type using `order_index`
- **RLS Protection**: Only teachers can modify questions and courses
- **JSONB Storage**: Courses use JSONB for flexible array storage

## Troubleshooting

### "Table does not exist" error
- Make sure you ran the migration SQL in Supabase SQL Editor
- Check that you're connected to the correct database

### "Permission denied" error
- Verify RLS policies are created
- Check that your user has the 'teacher' role in the profiles table
- Ensure you're authenticated

### Questions not loading
- Check browser console for errors
- Verify the table has data: `SELECT COUNT(*) FROM public.psychometric_questions WHERE is_active = true;`
- The app will fallback to static questions if database is unavailable

### Courses not loading
- Check browser console for errors
- Verify the table has data: `SELECT COUNT(*) FROM public.courses WHERE is_active = true;`
- Ensure courses exist for the user's RIASEC type
- Check that RLS policies allow students to read active courses
