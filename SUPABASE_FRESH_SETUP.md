# 🚀 EduVerse — Fresh Supabase Setup (From Scratch)

Follow these steps **in order** in your new Supabase project's **SQL Editor**.

---

## Step 1: Create All Tables

Copy-paste this entire block and run it:

```sql
-- ============================================
-- PROFILES (auto-created via trigger on signup)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STUDENTS
-- ============================================
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  semester INT NOT NULL DEFAULT 5,
  cgpa NUMERIC(4,2) DEFAULT 0,
  sgpa NUMERIC(4,2) DEFAULT 0,
  rank INT,
  attendance NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TEACHERS
-- ============================================
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  experience INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBJECTS
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  semester INT NOT NULL DEFAULT 5,
  credits INT NOT NULL DEFAULT 3,
  teacher_id UUID REFERENCES teachers(id)
);

-- ============================================
-- ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  due_date DATE NOT NULL,
  max_marks INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SUBMISSIONS
-- ============================================
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES assignments(id),
  student_id UUID REFERENCES students(id),
  file_name TEXT,
  file_size TEXT,
  file_url TEXT,
  marks INT,
  feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKS
-- ============================================
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  semester INT NOT NULL DEFAULT 5,
  internal_marks INT NOT NULL DEFAULT 0,
  external_marks INT NOT NULL DEFAULT 0,
  total_marks INT NOT NULL DEFAULT 0,
  max_marks INT NOT NULL DEFAULT 150,
  grade TEXT,
  grade_point NUMERIC(4,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'announcement' CHECK (type IN ('assignment','deadline','grade','announcement','mentor','alert')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MENTOR PAIRINGS (includes 'rejected' status)
-- ============================================
CREATE TABLE IF NOT EXISTS mentor_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES students(id),
  mentee_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'active', 'completed', 'rejected')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ANNOUNCEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  teacher_id UUID REFERENCES teachers(id),
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'class')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Step 2: Enable RLS & Create Policies

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ── STUDENTS (read: all authenticated, write: authenticated) ──
CREATE POLICY "Read students" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert students" ON students FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update students" ON students FOR UPDATE USING (auth.role() = 'authenticated');

-- ── TEACHERS ──
CREATE POLICY "Read teachers" ON teachers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert teachers" ON teachers FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── SUBJECTS ──
CREATE POLICY "Read subjects" ON subjects FOR SELECT USING (auth.role() = 'authenticated');

-- ── ASSIGNMENTS ──
CREATE POLICY "Read assignments" ON assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert assignments" ON assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── SUBMISSIONS ──
CREATE POLICY "Read submissions" ON submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert submissions" ON submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update submissions" ON submissions FOR UPDATE USING (auth.role() = 'authenticated');

-- ── MARKS ──
CREATE POLICY "Read marks" ON marks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert marks" ON marks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update marks" ON marks FOR UPDATE USING (auth.role() = 'authenticated');

-- ── NOTIFICATIONS (user-scoped read, authenticated insert) ──
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ── MENTOR PAIRINGS ──
CREATE POLICY "Read mentor_pairings" ON mentor_pairings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert mentor_pairings" ON mentor_pairings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update mentor_pairings" ON mentor_pairings FOR UPDATE USING (auth.role() = 'authenticated');

-- ── ANNOUNCEMENTS ──
CREATE POLICY "Read announcements" ON announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Insert announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## Step 3: Auto-Profile Trigger

This creates a profile row automatically when a user signs up:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## Step 4: Storage Bucket for File Submissions

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions');

-- Allow authenticated users to view/download files
CREATE POLICY "Allow authenticated views" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'submissions');
```

---

## Step 5: Disable Email Confirmation (Testing Only)

1. Go to **Authentication → Settings → Email**
2. **TURN OFF** "Enable email confirmations"
3. This lets you sign up and log in without checking email

---

## Step 6: Update `.env.local`

After creating the project, grab your project URL and anon key from **Settings → API** and update:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Step 7: Create Test Users (via the App)

1. Start the app: `npm run dev`
2. Go to `http://localhost:3000/signup`
3. Sign up a **student**: Name=`Arjun Mehta`, Email=`arjun@edu.com`, Password=`password123`, Role=Student
4. Sign up a **teacher**: Name=`Dr. Anil Kumar`, Email=`anil@edu.com`, Password=`password123`, Role=Teacher

Both will auto-create their profile + student/teacher records on first dashboard load.

---

## Step 8: Seed Sample Data

After signup, get the UUIDs from your Supabase **Authentication → Users** page.

```sql
-- Get the teacher record ID (run this first to get the UUID)
-- SELECT id FROM teachers LIMIT 1;

-- Insert subjects (replace <TEACHER_ID> with the UUID from the query above)
INSERT INTO subjects (name, code, department, semester, credits, teacher_id) VALUES
  ('Data Structures & Algorithms', 'CS301', 'Computer Science', 5, 4, '<TEACHER_ID>'),
  ('Database Management Systems', 'CS302', 'Computer Science', 5, 4, '<TEACHER_ID>'),
  ('Operating Systems', 'CS303', 'Computer Science', 5, 3, NULL),
  ('Computer Networks', 'CS304', 'Computer Science', 5, 3, NULL),
  ('Software Engineering', 'CS305', 'Computer Science', 5, 3, NULL);

-- (Optional) Insert sample marks
-- Get the student record ID: SELECT id FROM students LIMIT 1;
-- Get subject IDs: SELECT id, name FROM subjects;
-- INSERT INTO marks (student_id, subject_id, semester, internal_marks, external_marks, total_marks, max_marks, grade, grade_point)
-- VALUES ('<STUDENT_ID>', '<SUBJECT_ID>', 5, 42, 78, 120, 150, 'A', 8);
```

---

## Done! ✅

| Action | Result |
|--------|--------|
| Sign up as Student | Profile auto-created → redirects to `/student` |
| Sign up as Teacher | Profile auto-created → redirects to `/teacher` |
| Teacher → Students | Edit CGPA, attendance, rank — reflects on student dashboard |
| Teacher → Marks | Enter marks per subject → auto-calculates CGPA/SGPA |
| Teacher → Submissions | Grade submissions with marks and feedback |
| Teacher → Mentors | Generate suggestions → Approve/Reject → Students get notified |
| Student → Assignments | Submit PDF → status changes to "Submitted" |
| Student → Marks | Real marks from DB shown |
| Student → Mentors | See active pairings |
