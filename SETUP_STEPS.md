# 🚨 MANUAL STEPS — Do These in Supabase Dashboard

Everything in the codebase is now wired to Supabase. The app will work once you complete these manual steps.

---

## ✅ Step 1: Create the `profiles` Table (SQL Editor)

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Core profile table (auto-populated on signup)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users update own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

---

## ✅ Step 2: Create All Other Tables (SQL Editor)

Run this in one go:

```sql
-- Students
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  roll_number TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  semester INT NOT NULL DEFAULT 5,
  cgpa NUMERIC(3,1) DEFAULT 0,
  sgpa NUMERIC(3,1) DEFAULT 0,
  rank INT,
  attendance NUMERIC(4,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  experience INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'Computer Science',
  semester INT NOT NULL DEFAULT 5,
  credits INT NOT NULL DEFAULT 3,
  teacher_id UUID REFERENCES teachers(id)
);

-- Assignments
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

-- Submissions
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

-- Marks
CREATE TABLE IF NOT EXISTS marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  semester INT NOT NULL DEFAULT 5,
  internal_marks INT NOT NULL DEFAULT 0,
  external_marks INT NOT NULL DEFAULT 0,
  total_marks INT NOT NULL DEFAULT 0,
  max_marks INT NOT NULL DEFAULT 100,
  grade TEXT,
  grade_point NUMERIC(3,1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
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

-- Mentor Pairings
CREATE TABLE IF NOT EXISTS mentor_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES students(id),
  mentee_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'active', 'completed')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements
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

## ✅ Step 3: Enable RLS Policies (SQL Editor)

```sql
-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all common data
CREATE POLICY "Read students" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read teachers" ON teachers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read subjects" ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read assignments" ON assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read submissions" ON submissions FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read marks" ON marks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read mentor_pairings" ON mentor_pairings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Read announcements" ON announcements FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());

-- Allow inserts/updates for authenticated users (simplified for dev)
CREATE POLICY "Insert students" ON students FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert teachers" ON teachers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert submissions" ON submissions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update submissions" ON submissions FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Insert assignments" ON assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Insert announcements" ON announcements FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Update notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Insert notifications" ON notifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## ✅ Step 4: Create Auto-Profile Trigger (SQL Editor)

This auto-creates a profile when someone signs up:

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

## ✅ Step 5: Disable Email Confirmation (for testing)

1. Go to **Authentication → Settings → Email**
2. **TURN OFF** "Enable email confirmations"
3. This lets you sign up and immediately log in without checking email

---

## ✅ Step 6: Create Test Users (via the App)

1. Start the app: `npm run dev`
2. Go to **http://localhost:3000/signup**
3. Sign up a **student**: Name=`Arjun Mehta`, Email=`arjun@edu.com`, Password=`password123`, Role=Student
4. Sign up a **teacher**: Name=`Dr. Anil Kumar`, Email=`anil@edu.com`, Password=`password123`, Role=Teacher
5. Log in with either account — it should redirect to the dashboard

---

## ✅ Step 7: Link Users to Student/Teacher Tables (SQL Editor)

After signup, get the user UUIDs from **Authentication → Users** in Supabase dashboard.

```sql
-- Replace <STUDENT_UUID> with the actual UUID of arjun@edu.com
INSERT INTO students (user_id, roll_number, department, semester, cgpa, sgpa, rank, attendance)
VALUES ('<STUDENT_UUID>', 'CS2101', 'Computer Science', 5, 8.7, 8.9, 3, 92);

-- Replace <TEACHER_UUID> with the actual UUID of anil@edu.com  
INSERT INTO teachers (user_id, department, experience)
VALUES ('<TEACHER_UUID>', 'Computer Science', 12);
```

---

## ✅ Step 8: Seed Sample Data (SQL Editor)

Get the teacher ID from the `teachers` table first, then:

```sql
-- Insert subjects (replace <TEACHER_ID> with the UUID from teachers table)
INSERT INTO subjects (name, code, department, semester, credits, teacher_id) VALUES
  ('Data Structures & Algorithms', 'CS301', 'Computer Science', 5, 4, '<TEACHER_ID>'),
  ('Database Management Systems', 'CS302', 'Computer Science', 5, 4, '<TEACHER_ID>'),
  ('Operating Systems', 'CS303', 'Computer Science', 5, 3, NULL),
  ('Computer Networks', 'CS304', 'Computer Science', 5, 3, NULL),
  ('Software Engineering', 'CS305', 'Computer Science', 5, 3, NULL);

-- Insert sample assignments (get subject IDs from subjects table)
-- You can also create assignments through the Teacher dashboard UI!

-- Insert sample marks (get student_id from students table, subject_id from subjects table)
-- INSERT INTO marks (student_id, subject_id, semester, internal_marks, external_marks, total_marks, max_marks, grade, grade_point)
-- VALUES ('<STUDENT_ID>', '<SUBJECT_ID>', 5, 38, 72, 82, 100, 'A', 8);
```

---

## ✅ Step 9: Create Storage Bucket & Policies (SQL Editor)

Run this in your SQL Editor to create the bucket and allow uploads/downloads:

```sql
-- Create the bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'submissions');

-- Allow authenticated users to view files
CREATE POLICY "Allow authenticated views" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'submissions');
```

---

## Summary: What Happens After These Steps

| Action | Result |
|--------|--------|
| Sign up as Student | Profile auto-created, redirects to `/student` |
| Sign up as Teacher | Profile auto-created, redirects to `/teacher` |
| Login | Supabase Auth verifies credentials, loads profile |
| Dashboard | Shows real data from your tables |
| Create Assignment (teacher) | Inserts into `assignments` table |
| Submit Assignment (student) | Uploads file + creates submission record |
| Grade Submission (teacher) | Updates submission with marks/feedback |
| Marks page | Shows real marks from `marks` table |
| Notifications | Shows user-specific notifications |
| Mentors | Shows pairings from `mentor_pairings` table |

**The demo quick-fill buttons on the login page will still work — they fill in the email/password fields, and Supabase Auth handles the actual verification.**
