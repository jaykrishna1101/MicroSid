# EduVerse — Smart Student Portal

A production-grade, modern Student Portal Web App built with **Next.js 15**, **TypeScript**, **TailwindCSS 4**, **ShadCN UI**, **Framer Motion**, **Zustand**, **TanStack Query**, and **Recharts**.

---

## Features

### Authentication
- Login & Signup with role selection (Student/Teacher)
- Protected routes with automatic redirects
- Session persistence via localStorage
- Demo quick-login buttons

### Student Features
- **Dashboard** — CGPA card, stat cards, performance trend chart, deadline widget, notifications, calendar, leaderboard, mentor suggestions
- **Assignments** — Tab-filtered list, status badges, submit dialog with file upload
- **Marks** — Subject-wise marks table, grade badges, interactive SGPA/CGPA calculator
- **Analytics** — Line chart trends, radar chart, subject comparison bar chart
- **Calendar** — Interactive calendar with event highlighting
- **Notifications** — Typed notifications with read/unread state
- **Mentors** — Peer mentor suggestion cards

### Teacher Features
- **Dashboard** — Class stats, CGPA distribution chart, at-risk student alerts, announcements
- **Assignments** — Create assignments with deadline, view submission progress
- **Submissions** — Filter by assignment, inline grading dialog
- **Marks** — Batch mark entry table
- **Analytics** — Subject difficulty, risk distribution pie chart, weak student details
- **Announcements** — Create with priority & audience targeting
- **Mentors** — Approve/reject suggested mentor pairings

### Smart Features
- Weak student auto-detection
- Peer mentor matching algorithm
- Deadline urgency indicators
- Performance trend analysis
- Toggleable leaderboard

### UI & Animations
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

## Quick Start

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

---

## Project Structure

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

## License

MIT
