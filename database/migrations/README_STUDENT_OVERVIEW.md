# Student Overview Feature - Teacher Access

This feature allows teachers (counsellors) to view a high-level overview of students' RIASEC results by class for counselling purposes.

## Overview

The Student Overview page provides teachers with:
- A class selector dropdown
- List of students in the selected class
- Each student's name, class, and dominant RIASEC code (1-2 codes only)
- Summary statistics showing number of students per RIASEC category

## Security & Access Control

- **Teacher-only access**: Only users with teacher role can access this page
- **Read-only**: Teachers can only view data, not edit or delete
- **RLS Policies**: Row Level Security policies ensure proper access control

## Database Setup

### Step 1: Run the RLS Migration

Run the SQL migration file to grant teachers read access to student data:

```sql
-- Run this file in Supabase SQL Editor:
database/migrations/create_teacher_student_overview_rls.sql
```

This creates two RLS policies:
1. `profiles_select_for_teachers` - Allows teachers to read student profiles
2. `psychometric_results_select_for_teachers` - Allows teachers to read RIASEC results

### Step 2: Verify Policies

After running the migration, verify the policies exist:

```sql
-- Check profiles policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check psychometric_results policies
SELECT * FROM pg_policies WHERE tablename = 'psychometric_results';
```

## Features

### Class Selection
- Teachers can select any class from a dropdown
- Classes are automatically populated from student profiles
- Empty classes are handled gracefully

### Student List
- Shows all students in the selected class
- Displays:
  - Student name
  - Class
  - Dominant RIASEC code (1-2 codes, e.g., "I" or "I-S")
  - "No test result" indicator for students who haven't completed the test

### Summary Statistics
- Total number of students in the class
- Number of students with completed tests
- Breakdown by RIASEC category (R, I, A, S, E, C)

## Data Privacy

**Important Restrictions:**
- ❌ Full RIASEC scores are NOT shown
- ❌ Test answers are NOT shown
- ❌ Students are NOT ranked
- ❌ Student data cannot be edited
- ❌ Sensitive personal data is NOT exposed

**What IS shown:**
- ✅ Student name and class only
- ✅ Dominant RIASEC code (1-2 letters)
- ✅ Summary statistics (counts only)

## Usage

1. Navigate to "Student Overview" in the teacher sidebar
2. Select a class from the dropdown
3. View the list of students and their dominant RIASEC codes
4. Review summary statistics for counselling insights

## Troubleshooting

### "Failed to load classes"
- Check that RLS policies are created
- Verify teachers can access the `profiles` table
- Ensure there are students with class data

### "Failed to load students"
- Check RLS policies for `profiles` table
- Verify the selected class exists
- Check browser console for detailed error messages

### "No students found"
- The class may be empty
- Students may not have completed their profiles
- Check that students have a `class` field set

### "Permission denied" errors
- Run the RLS migration SQL file
- Verify the user is a teacher (exists in `teacher_profiles` table)
- Check Supabase logs for RLS policy violations

## Revoking Access

If you need to revoke teacher access to student data:

```sql
DROP POLICY IF EXISTS "profiles_select_for_teachers" ON public.profiles;
DROP POLICY IF EXISTS "psychometric_results_select_for_teachers" ON public.psychometric_results;
```
