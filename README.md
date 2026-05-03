# 🎓 EduVerse — Smart Student Portal

A production-grade, modern Student Portal Web App built with **Next.js 15**, **TypeScript**, **TailwindCSS 4**, **ShadCN UI**, **Framer Motion**, **Zustand**, **TanStack Query**, and **Recharts**.

---

## ✨ Features

### 🔐 Authentication
- Login & Signup with role selection (Student/Teacher)
- Protected routes with automatic redirects
- Session persistence via localStorage
- Demo quick-login buttons

### 🎓 Student Features
- **Dashboard** — CGPA card, stat cards, performance trend chart, deadline widget, notifications, calendar, leaderboard, mentor suggestions
- **Assignments** — Tab-filtered list, status badges, submit dialog with file upload
- **Marks** — Subject-wise marks table, grade badges, interactive SGPA/CGPA calculator
- **Analytics** — Line chart trends, radar chart, subject comparison bar chart
- **Calendar** — Interactive calendar with event highlighting
- **Notifications** — Typed notifications with read/unread state
- **Mentors** — Peer mentor suggestion cards

### 👨‍🏫 Teacher Features
- **Dashboard** — Class stats, CGPA distribution chart, at-risk student alerts, announcements
- **Assignments** — Create assignments with deadline, view submission progress
- **Submissions** — Filter by assignment, inline grading dialog
- **Marks** — Batch mark entry table
- **Analytics** — Subject difficulty, risk distribution pie chart, weak student details
- **Announcements** — Create with priority & audience targeting
- **Mentors** — Approve/reject suggested mentor pairings

### 🧠 Smart Features
- Weak student auto-detection
- Peer mentor matching algorithm
- Deadline urgency indicators
- Performance trend analysis
- Toggleable leaderboard

### 🎨 UI & Animations
- Dark/light mode toggle
- Framer Motion page transitions
- Staggered widget load animations
- Animated CGPA circular progress
- Notification bell shake animation
- Card hover elevation effects
- Chart entrance animations
- Skeleton loading states
- Glassmorphism effects
- Custom scrollbar

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.17+
- **npm** 9+

### Installation

```bash
cd siddhant
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | arjun@edu.com | demo |
| Teacher | anil@edu.com | demo |

Any email/password works — the mock backend accepts all credentials.

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, signup)
│   ├── (dashboard)/        # Dashboard pages (student, teacher)
│   └── layout.tsx          # Root layout with providers
├── components/
│   ├── ui/                 # ShadCN UI primitives (22 components)
│   ├── layout/             # Sidebar, Navbar, MobileNav, ThemeToggle
│   ├── dashboard/          # Dashboard widgets
│   └── shared/             # PageTransition, AnimatedCard, Skeletons
├── data/                   # Mock data
├── lib/                    # Utilities (cn, constants)
├── providers/              # React context providers
├── services/               # API service layer (mock)
├── store/                  # Zustand state stores
└── types/                  # TypeScript interfaces
```

---

## 🗄️ Supabase Integration Guide

### Step 1: Create a Supabase Project (YOU must do this)
1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**, set name and password
3. Select a region close to you
4. Wait for creation

### Step 2: Get Your API Keys (YOU must do this)
1. Go to **Settings > API** in Supabase dashboard
2. Copy **Project URL** and **anon public key**
3. Paste in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### Step 3: Install Supabase Client
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### Step 4: Create Supabase Client
Create `src/lib/supabase.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 5: Database Schema (Run in Supabase SQL Editor — YOU must do this)
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL, email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher')),
  avatar TEXT, department TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  roll_number TEXT UNIQUE NOT NULL, department TEXT NOT NULL,
  semester INTEGER NOT NULL, cgpa DECIMAL(3,1) DEFAULT 0,
  sgpa DECIMAL(3,1) DEFAULT 0, rank INTEGER,
  attendance DECIMAL(4,1) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL, experience INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, code TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL, semester INTEGER NOT NULL,
  credits INTEGER NOT NULL, teacher_id UUID REFERENCES teachers(id)
);

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL, description TEXT,
  subject_id UUID REFERENCES subjects(id),
  teacher_id UUID REFERENCES teachers(id),
  due_date TIMESTAMPTZ NOT NULL, max_marks INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id),
  file_url TEXT, file_name TEXT, file_size TEXT,
  marks INTEGER, feedback TEXT,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  semester INTEGER NOT NULL, internal_marks INTEGER DEFAULT 0,
  external_marks INTEGER DEFAULT 0, total_marks INTEGER DEFAULT 0,
  max_marks INTEGER DEFAULT 100, grade TEXT,
  grade_point DECIMAL(3,1) DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL, message TEXT NOT NULL,
  type TEXT NOT NULL, is_read BOOLEAN DEFAULT FALSE,
  link TEXT, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE mentor_pairings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID REFERENCES students(id),
  mentee_id UUID REFERENCES students(id),
  subject_id UUID REFERENCES subjects(id),
  status TEXT DEFAULT 'suggested', reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL, message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  teacher_id UUID REFERENCES teachers(id),
  target_audience TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 6: Enable RLS Policies (YOU must do this)
```sql
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

CREATE POLICY "Public profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own profile update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "View students" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "View teachers" ON teachers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "View subjects" ON subjects FOR SELECT USING (true);
CREATE POLICY "View assignments" ON assignments FOR SELECT USING (true);
CREATE POLICY "Create assignments" ON assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);
CREATE POLICY "View own submissions" ON submissions FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Submit work" ON submissions FOR INSERT WITH CHECK (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);
CREATE POLICY "View own marks" ON marks FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
```

### Step 7: Enable Auth (YOU must do this)
1. **Authentication > Providers** — Enable Email provider
2. Optionally enable Google, GitHub OAuth

### Step 8: Storage (YOU must do this)
1. **Storage** — Create bucket `submissions` (private)
2. Add upload policy for authenticated users

### Step 9: Replace Mock Services
Replace functions in `src/services/api.ts` with Supabase queries.

---

## ⚠️ Things YOU Must Do (Cannot Be Done By AI)

| # | Task | Where |
|---|------|-------|
| 1 | Create Supabase account & project | [supabase.com](https://supabase.com) |
| 2 | Copy API keys to `.env.local` | Settings > API |
| 3 | Run SQL schema in SQL Editor | SQL Editor |
| 4 | Configure RLS policies | SQL Editor |
| 5 | Enable Auth providers | Authentication > Providers |
| 6 | Create storage bucket | Storage > New Bucket |
| 7 | Set up email templates (optional) | Auth > Email Templates |
| 8 | Deploy to Vercel and set env vars | Vercel Dashboard |

## 🔑 Things I CAN Help You With

- ✅ Writing Supabase client setup code
- ✅ Converting mock services to real Supabase queries
- ✅ Setting up Auth with Next.js middleware
- ✅ Writing Edge Functions for smart features
- ✅ Real-time subscriptions for notifications
- ✅ File upload logic with Supabase Storage
- ✅ Deploying to Vercel

---

## 📄 License

MIT
