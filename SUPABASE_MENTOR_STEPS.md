# Supabase Updates: Mentor Pairings & Analytics

Based on the recent integrations, your frontend is now fully connected to the backend for Mentor Assignments and Real-time Chart Analytics. If you haven't created the `mentor_pairings` table in your Supabase database yet, please execute the following SQL in your Supabase SQL Editor.

## 1. Create `mentor_pairings` Table

Run this snippet to create the table and its associated Row Level Security (RLS) policies so teachers can approve/reject pairings:

```sql
CREATE TABLE IF NOT EXISTS public.mentor_pairings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    mentee_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('suggested', 'active', 'rejected', 'completed')) DEFAULT 'suggested',
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mentor_pairings ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read pairings
CREATE POLICY "Anyone can view mentor pairings" 
ON public.mentor_pairings FOR SELECT USING (true);

-- Allow authenticated users to insert (e.g. students requesting mentors)
CREATE POLICY "Authenticated users can insert mentor pairings" 
ON public.mentor_pairings FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Allow teachers to update status (approve/reject)
CREATE POLICY "Teachers can update mentor pairings" 
ON public.mentor_pairings FOR UPDATE 
USING (
  EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);
```

## 2. Note on Dashboard Analytics (Marks Table)

The Student Dashboard now computes actual **SGPA Trends** and **Subject Performance** directly from the `marks` table instead of relying on mock data. 

* **If your charts appear empty or show "0"**, it is because the logged-in student has no records in the `marks` table.
* To see the charts populate beautifully, insert some test data into the `marks` table for your specific student's UUID.

Example snippet to populate test data:
```sql
-- Replace <student_id> and <subject_id> with real UUIDs from your tables!
-- INSERT INTO marks (student_id, subject_id, semester, internal_marks, external_marks, total_marks, max_marks, grade, grade_point)
-- VALUES ('<student_id>', '<subject_id>', 1, 30, 45, 75, 100, 'A', 8);
```
