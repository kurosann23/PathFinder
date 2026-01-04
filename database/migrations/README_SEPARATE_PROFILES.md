# Separate Student and Teacher Profiles Migration

This migration separates student and teacher profiles into different database tables, allowing each role to have different fields and data structures.

## What Changed

### Database Structure

**Before:**
- Single `profiles` table with a `role` field
- All users (students and teachers) stored in the same table

**After:**
- `student_profiles` table - for student-specific data
- `teacher_profiles` table - for teacher-specific data  
- `profiles` table - minimal table with just `id` and `role` for role checks

### Student Profile Fields
- `id` (UUID, references auth.users)
- `full_name` (TEXT)
- `class` (TEXT)
- `email` (TEXT)
- `avatar_url` (TEXT)
- `about_me` (TEXT)
- `skills` (JSONB)
- `interests` (JSONB)
- `hobbies` (JSONB)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### Teacher Profile Fields
- `id` (UUID, references auth.users)
- `full_name` (TEXT)
- `email` (TEXT)
- `phone` (TEXT)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

## Migration Steps

1. **Run the migration SQL:**
   - Open Supabase SQL Editor
   - Copy and run `create_separate_profiles.sql`
   - This creates the new tables and RLS policies

2. **Migrate existing data (if any):**
   - If you have existing data in the `profiles` table, uncomment and run the migration helper function in the SQL file
   - This will copy existing data to the appropriate new table based on role

3. **Update your code:**
   - The code has already been updated to use the new separate profile functions
   - `fetchProfile()` automatically determines role and fetches from the correct table
   - `upsertProfile()` automatically saves to the correct table based on role

## Code Changes

### profileRepo.ts
- Added `StudentProfileRow` and `TeacherProfileRow` types
- Added `fetchStudentProfile()` and `fetchTeacherProfile()` functions
- Added `upsertStudentProfile()` and `upsertTeacherProfile()` functions
- Updated `fetchProfile()` to automatically fetch from the correct table
- Updated `upsertProfile()` to automatically save to the correct table

### ProfileContext.tsx
- No changes needed - uses `fetchProfile()` which handles the separation automatically

### ProfilePage.tsx
- Added type guards: `isStudentProfile()` and `isTeacherProfile()`
- Updated to handle union types properly
- Teacher profile view uses teacher-specific fields (phone)
- Student profile view uses student-specific fields (class, skills, hobbies, etc.)

## Benefits

1. **Type Safety**: Separate types prevent mixing student and teacher fields
2. **Database Efficiency**: Each table only has relevant columns
3. **Scalability**: Easy to add role-specific fields without affecting the other role
4. **Data Integrity**: Clear separation of concerns

## Usage

The API remains the same from the component perspective:

```typescript
// Fetch profile (automatically gets correct type based on role)
const { profile } = useProfile()

// Save profile (automatically saves to correct table)
await upsertProfile({
  id: userId,
  full_name: 'John Doe',
  // ... other fields
  role: 'student' // or 'teacher'
})
```

The system automatically:
- Determines which table to read from based on user role
- Determines which table to write to based on role
- Handles type checking and validation
