# 🗄️ Supabase Integration — Steps 7-10

> **Pre-requisite**: You've completed Steps 1–6 (project created, API keys set, `@supabase/ssr` installed, `src/lib/supabase.ts` created, DB schema deployed, RLS policies applied).

---

## Step 7: Enable Supabase Auth

### 7.1 — Enable Email Provider (Supabase Dashboard)

1. Go to **Authentication → Providers** in your Supabase dashboard
2. Click **Email** and ensure it's **enabled**
3. Recommended settings:
   - ✅ Enable email confirmations (toggle OFF for dev, ON for production)
   - ✅ Minimum password length: 6
4. Click **Save**

### 7.2 — (Optional) Enable OAuth Providers

For Google login:
1. Go to **Authentication → Providers → Google**
2. Toggle it **ON**
3. You'll need a Google Cloud OAuth Client ID and Secret
4. Set the redirect URL shown in Supabase in your Google Console

### 7.3 — Create an Auth Trigger (Run in SQL Editor)

This auto-creates a profile row when a user signs up:

```sql
-- Function to create profile on signup
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

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

> This reads `name` and `role` from signup metadata and inserts into `profiles`.

---

## Step 8: Set Up Supabase Storage

### 8.1 — Create Storage Bucket (Supabase Dashboard)

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name: `submissions`
4. Toggle **Public** to **OFF** (keep it private)
5. Allowed MIME types: `application/pdf, application/zip, image/*`
6. Max file size: `10MB`
7. Click **Create Bucket**

### 8.2 — Add Storage Policies (SQL Editor)

```sql
-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT
WITH CHECK (
  auth.role() = 'authenticated'
  AND bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to read their own files
CREATE POLICY "Users read own files"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND bucket_id = 'submissions'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow teachers to read all submission files
CREATE POLICY "Teachers read all submissions"
ON storage.objects FOR SELECT
USING (
  auth.role() = 'authenticated'
  AND bucket_id = 'submissions'
  AND EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);
```

---

## Step 9: Replace Mock Services with Real Supabase Queries

This is the core step. You need to update **two files**:

### 9.1 — Update `src/services/api.ts`

Replace the entire file with real Supabase calls:

```typescript
import { createClient } from "@/lib/supabase";
import type {
  User, LoginCredentials, SignupData, Assignment, Submission,
  Mark, Notification, MentorPairing, Announcement,
  PerformanceTrend, SubjectPerformance, WeakStudent,
  CalendarEvent, Student, Teacher, Subject,
} from "@/types";

const supabase = createClient();

// ─── Auth ───────────────────────────────────────────────
export async function loginUser(creds: LoginCredentials): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: creds.email,
    password: creds.password,
  });
  if (error) throw new Error(error.message);

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return {
    id: data.user.id,
    email: data.user.email!,
    name: profile?.name || "User",
    role: profile?.role || "student",
    avatar: profile?.avatar,
    createdAt: data.user.created_at,
  };
}

export async function signupUser(data: SignupData): Promise<User> {
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { name: data.name, role: data.role },  // stored in raw_user_meta_data
    },
  });
  if (error) throw new Error(error.message);

  return {
    id: authData.user!.id,
    email: data.email,
    name: data.name,
    role: data.role,
    createdAt: new Date().toISOString(),
  };
}

export async function logoutUser(): Promise<void> {
  await supabase.auth.signOut();
}

// ─── Students ───────────────────────────────────────────
export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("*, profiles(name, email, avatar)")
    .order("cgpa", { ascending: false });
  if (error) throw error;

  return (data || []).map((s: any) => ({
    id: s.id,
    userId: s.user_id,
    name: s.profiles?.name || "",
    email: s.profiles?.email || "",
    avatar: s.profiles?.avatar || s.profiles?.name?.split(" ").map((w: string) => w[0]).join("") || "U",
    rollNumber: s.roll_number,
    department: s.department,
    semester: s.semester,
    cgpa: Number(s.cgpa),
    sgpa: Number(s.sgpa),
    rank: s.rank || 0,
    totalStudents: 60,
    attendance: Number(s.attendance),
    subjects: [],
    joinedAt: s.created_at,
  }));
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const students = await getStudents();
  return students.find((s) => s.id === id || s.userId === id);
}

export async function getCurrentStudent(): Promise<Student> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const student = await getStudentById(user.id);
  if (!student) throw new Error("Student profile not found");
  return student;
}

// ─── Teachers ───────────────────────────────────────────
export async function getTeachers(): Promise<Teacher[]> {
  const { data, error } = await supabase
    .from("teachers")
    .select("*, profiles(name, email, avatar)");
  if (error) throw error;

  return (data || []).map((t: any) => ({
    id: t.id,
    userId: t.user_id,
    name: t.profiles?.name || "",
    email: t.profiles?.email || "",
    avatar: t.profiles?.avatar || t.profiles?.name?.split(" ").map((w: string) => w[0]).join("") || "T",
    department: t.department,
    subjects: [],
    experience: t.experience,
    totalStudents: 60,
    joinedAt: t.created_at,
  }));
}

export async function getCurrentTeacher(): Promise<Teacher> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const teachers = await getTeachers();
  const teacher = teachers.find((t) => t.userId === user.id);
  if (!teacher) throw new Error("Teacher profile not found");
  return teacher;
}

// ─── Subjects ───────────────────────────────────────────
export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from("subjects").select("*");
  if (error) throw error;
  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    department: s.department,
    semester: s.semester,
    credits: s.credits,
    teacherId: s.teacher_id,
  }));
}

// ─── Assignments ────────────────────────────────────────
export async function getAssignments(): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from("assignments")
    .select("*, subjects(name, code), teachers:teacher_id(profiles(name))")
    .order("due_date", { ascending: true });
  if (error) throw error;

  const now = new Date();
  return (data || []).map((a: any) => {
    const dueDate = new Date(a.due_date);
    let status: Assignment["status"] = "pending";
    if (dueDate < now) status = "overdue";

    return {
      id: a.id,
      title: a.title,
      description: a.description || "",
      subjectId: a.subject_id,
      subjectName: a.subjects?.name || "",
      teacherId: a.teacher_id,
      teacherName: a.teachers?.profiles?.name || "",
      dueDate: a.due_date,
      createdAt: a.created_at,
      maxMarks: a.max_marks,
      status,
      totalSubmissions: 0,
      totalStudents: 60,
    };
  });
}

export async function getAssignmentById(id: string): Promise<Assignment | undefined> {
  const assignments = await getAssignments();
  return assignments.find((a) => a.id === id);
}

export async function createAssignment(input: Partial<Assignment>): Promise<Assignment> {
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      title: input.title,
      description: input.description,
      subject_id: input.subjectId,
      teacher_id: input.teacherId,
      due_date: input.dueDate,
      max_marks: input.maxMarks || 100,
    })
    .select()
    .single();
  if (error) throw error;
  return { ...data, id: data.id } as unknown as Assignment;
}

// ─── Submissions ────────────────────────────────────────
export async function getSubmissions(assignmentId?: string): Promise<Submission[]> {
  let query = supabase
    .from("submissions")
    .select("*, students:student_id(profiles(name, avatar))");
  if (assignmentId) query = query.eq("assignment_id", assignmentId);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((s: any) => ({
    id: s.id,
    assignmentId: s.assignment_id,
    studentId: s.student_id,
    studentName: s.students?.profiles?.name || "",
    studentAvatar: s.students?.profiles?.avatar || "U",
    submittedAt: s.submitted_at,
    fileName: s.file_name || "",
    fileSize: s.file_size || "",
    marks: s.marks,
    maxMarks: 100,
    feedback: s.feedback,
    status: s.status,
  }));
}

export async function submitAssignment(assignmentId: string, file: File): Promise<Submission> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Get student record
  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!student) throw new Error("Student not found");

  // Upload file
  const filePath = `${user.id}/${assignmentId}/${file.name}`;
  const { error: uploadErr } = await supabase.storage
    .from("submissions")
    .upload(filePath, file, { upsert: true });
  if (uploadErr) throw uploadErr;

  // Create submission record
  const { data, error } = await supabase
    .from("submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: student.id,
      file_name: file.name,
      file_size: `${(file.size / 1024).toFixed(0)} KB`,
      file_url: filePath,
      status: "submitted",
    })
    .select()
    .single();
  if (error) throw error;

  return {
    id: data.id,
    assignmentId,
    studentId: student.id,
    studentName: "",
    studentAvatar: "",
    submittedAt: data.submitted_at,
    fileName: file.name,
    fileSize: `${(file.size / 1024).toFixed(0)} KB`,
    maxMarks: 100,
    status: "submitted",
  };
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string): Promise<Submission> {
  const { data, error } = await supabase
    .from("submissions")
    .update({ marks, feedback, status: "graded" })
    .eq("id", submissionId)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Submission;
}

// ─── Marks ──────────────────────────────────────────────
export async function getMarks(studentId?: string): Promise<Mark[]> {
  let query = supabase
    .from("marks")
    .select("*, subjects:subject_id(name, code, credits)");
  if (studentId) query = query.eq("student_id", studentId);

  const { data, error } = await query;
  if (error) throw error;

  return (data || []).map((m: any) => ({
    id: m.id,
    studentId: m.student_id,
    subjectId: m.subject_id,
    subjectName: m.subjects?.name || "",
    subjectCode: m.subjects?.code || "",
    credits: m.subjects?.credits || 0,
    semester: m.semester,
    internalMarks: m.internal_marks,
    externalMarks: m.external_marks,
    totalMarks: m.total_marks,
    maxMarks: m.max_marks,
    grade: m.grade || "",
    gradePoint: Number(m.grade_point),
  }));
}

// ─── Notifications ──────────────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data || []).map((n: any) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.is_read,
    createdAt: n.created_at,
    link: n.link,
  }));
}

export async function markNotificationRead(id: string): Promise<void> {
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

// ─── Mentors ────────────────────────────────────────────
export async function getMentorPairings(): Promise<MentorPairing[]> {
  const { data, error } = await supabase
    .from("mentor_pairings")
    .select(`
      *,
      mentor:mentor_id(id, cgpa, profiles:user_id(name, avatar)),
      mentee:mentee_id(id, cgpa, profiles:user_id(name, avatar)),
      subjects:subject_id(name)
    `);
  if (error) throw error;

  return (data || []).map((mp: any) => ({
    id: mp.id,
    mentorId: mp.mentor_id,
    mentorName: mp.mentor?.profiles?.name || "",
    mentorAvatar: mp.mentor?.profiles?.avatar || "M",
    mentorCgpa: Number(mp.mentor?.cgpa || 0),
    menteeId: mp.mentee_id,
    menteeName: mp.mentee?.profiles?.name || "",
    menteeAvatar: mp.mentee?.profiles?.avatar || "M",
    menteeCgpa: Number(mp.mentee?.cgpa || 0),
    subject: mp.subjects?.name || "",
    subjectId: mp.subject_id,
    status: mp.status,
    reason: mp.reason || "",
  }));
}

// ─── Announcements ──────────────────────────────────────
export async function getAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("announcements")
    .select("*, teachers:teacher_id(profiles:user_id(name))")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data || []).map((a: any) => ({
    id: a.id,
    title: a.title,
    message: a.message,
    priority: a.priority,
    teacherId: a.teacher_id,
    teacherName: a.teachers?.profiles?.name || "",
    createdAt: a.created_at,
    targetAudience: a.target_audience,
  }));
}

export async function createAnnouncement(input: Partial<Announcement>): Promise<Announcement> {
  const teacher = await getCurrentTeacher();
  const { data, error } = await supabase
    .from("announcements")
    .insert({
      title: input.title,
      message: input.message,
      priority: input.priority || "medium",
      teacher_id: teacher.id,
      target_audience: input.targetAudience || "all",
    })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as Announcement;
}

// ─── Analytics (computed from real data) ────────────────
export async function getPerformanceTrends(): Promise<PerformanceTrend[]> {
  // For now, return mock data. In production, compute from marks table.
  // You could create a Supabase Edge Function or a DB view for this.
  const { performanceTrends } = await import("@/data/mock");
  return performanceTrends;
}

export async function getSubjectPerformances(): Promise<SubjectPerformance[]> {
  const { subjectPerformances } = await import("@/data/mock");
  return subjectPerformances;
}

export async function getWeakStudents(): Promise<WeakStudent[]> {
  // Compute from real student data
  const students = await getStudents();
  const avgCgpa = students.reduce((s, st) => s + st.cgpa, 0) / (students.length || 1);

  return students
    .filter((s) => s.cgpa < avgCgpa)
    .map((s) => ({
      studentId: s.id,
      studentName: s.name,
      studentAvatar: s.avatar,
      cgpa: s.cgpa,
      weakSubjects: [], // compute from marks if needed
      riskLevel: s.cgpa < 6 ? "high" as const : s.cgpa < 7 ? "medium" as const : "low" as const,
      trend: "stable" as const,
    }));
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  // Generate from assignments due dates
  const assignments = await getAssignments();
  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    date: a.dueDate,
    type: "assignment" as const,
    color: "#6366f1",
  }));
}
```

### 9.2 — Update `src/store/index.ts` (Auth Store)

Update the logout function to call Supabase sign-out:

```typescript
// In useAuthStore, update the logout function:
logout: () => {
  import("@/lib/supabase").then(({ createClient }) => {
    createClient().auth.signOut();
  });
  set({ user: null, isAuthenticated: false });
},
```

### 9.3 — Update `src/providers/AuthProvider.tsx`

Add Supabase session listener so auth state syncs automatically:

```typescript
"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { createClient } from "@/lib/supabase";

const publicPaths = ["/login", "/signup", "/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, setUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  // Listen to Supabase auth state changes
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
              role: profile.role,
              avatar: profile.avatar,
              createdAt: session.user.created_at,
            });
          }
        }
        if (event === "SIGNED_OUT") {
          logout();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, logout]);

  // Route protection
  useEffect(() => {
    if (!isAuthenticated && !publicPaths.includes(pathname)) {
      router.replace("/login");
    }
    if (isAuthenticated && publicPaths.includes(pathname)) {
      router.replace(user?.role === "teacher" ? "/teacher" : "/student");
    }
  }, [isAuthenticated, pathname, router, user]);

  return <>{children}</>;
}
```

---

## Step 10: Seed Your Database with Test Data

Since you're moving from mock to real data, you need data in your DB. Run this in the **SQL Editor**:

```sql
-- ⚠️ First create test users through the Supabase Auth dashboard or signup flow.
-- Then run the below to populate student/teacher/subject data.

-- Insert subjects
INSERT INTO subjects (name, code, department, semester, credits) VALUES
  ('Data Structures & Algorithms', 'CS301', 'Computer Science', 5, 4),
  ('Database Management Systems', 'CS302', 'Computer Science', 5, 4),
  ('Operating Systems', 'CS303', 'Computer Science', 5, 3),
  ('Computer Networks', 'CS304', 'Computer Science', 5, 3),
  ('Software Engineering', 'CS305', 'Computer Science', 5, 3);

-- After users sign up, their profiles are auto-created by the trigger.
-- Then manually insert into the students/teachers table linking to profiles.
-- Example (replace UUIDs with real user IDs from auth.users):
--
-- INSERT INTO students (user_id, roll_number, department, semester, cgpa, sgpa, rank, attendance)
-- VALUES ('<user-uuid>', 'CS2101', 'Computer Science', 5, 8.7, 8.9, 3, 92);
--
-- INSERT INTO teachers (user_id, department, experience)
-- VALUES ('<teacher-uuid>', 'Computer Science', 12);
```

### Quick way to seed: Create test accounts

1. Go to **Authentication → Users** in Supabase dashboard
2. Click **Add User → Create New User**
3. Create a student: `arjun@edu.com` / `password123`
4. Create a teacher: `anil@edu.com` / `password123`
5. Copy their UUIDs from the users table
6. Run the INSERT statements above with real UUIDs

---

## Step 11: (Optional) Real-Time Notifications

Add live push notifications using Supabase Realtime:

```typescript
// In your NotificationPanel or AuthProvider:
useEffect(() => {
  const supabase = createClient();
  const channel = supabase
    .channel("notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user?.id}`,
      },
      (payload) => {
        // Add new notification to store
        const n = payload.new as any;
        toast.info(n.title);
        // Refresh notification list
      }
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [user?.id]);
```

---

## Quick Reference: What Changed Where

| File | Change |
|------|--------|
| `src/services/api.ts` | All mock functions → real Supabase queries |
| `src/store/index.ts` | `logout()` calls `supabase.auth.signOut()` |
| `src/providers/AuthProvider.tsx` | Added `onAuthStateChange` listener |
| `src/lib/supabase.ts` | Already done ✅ |
| `.env.local` | Already done ✅ |

> **Note**: The `src/data/mock.ts` file is kept as a fallback for analytics charts that don't have real computation yet. Once you have enough real marks data, you can replace those too.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Invalid login credentials" | Make sure user exists in Auth → Users |
| "relation does not exist" | Re-run the schema SQL from Step 5 |
| "new row violates RLS" | Check your RLS policies from Step 6 |
| Profile not created on signup | Check the trigger from Step 7.3 |
| File upload fails | Verify storage bucket & policies from Step 8 |
| "Not authenticated" errors | Check `.env.local` has correct keys |
