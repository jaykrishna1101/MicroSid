export const APP_NAME = "EduVerse";
export const APP_DESCRIPTION = "Smart Student Portal for Modern Education";

export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const GRADE_POINTS: Record<string, number> = {
  "O": 10, "A+": 9, "A": 8, "B+": 7, "B": 6, "C": 5, "D": 4, "F": 0,
};

export const DEPARTMENTS = [
  "Computer Science", "Electronics", "Mechanical", "Civil", "Electrical",
] as const;

export const NAV_STUDENT = [
  { label: "Dashboard", href: "/student", icon: "LayoutDashboard" },
  { label: "Assignments", href: "/student/assignments", icon: "ClipboardList" },
  { label: "Marks", href: "/student/marks", icon: "Award" },
  { label: "Analytics", href: "/student/analytics", icon: "BarChart3" },
  { label: "Calendar", href: "/student/calendar", icon: "Calendar" },
  { label: "Notifications", href: "/student/notifications", icon: "Bell" },
  { label: "Mentors", href: "/student/mentors", icon: "Users" },
] as const;

export const NAV_TEACHER = [
  { label: "Dashboard", href: "/teacher", icon: "LayoutDashboard" },
  { label: "Students", href: "/teacher/students", icon: "Users" },
  { label: "Assignments", href: "/teacher/assignments", icon: "ClipboardList" },
  { label: "Submissions", href: "/teacher/submissions", icon: "FileCheck" },
  { label: "Marks", href: "/teacher/marks", icon: "Award" },
  { label: "Analytics", href: "/teacher/analytics", icon: "BarChart3" },
  { label: "Announcements", href: "/teacher/announcements", icon: "Megaphone" },
  { label: "Mentors", href: "/teacher/mentors", icon: "Users" },
] as const;
