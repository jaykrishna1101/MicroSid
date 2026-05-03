// ─── Auth ───────────────────────────────────────────────
export type Role = "student" | "teacher";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<Role>;
  signup: (data: SignupData) => Promise<Role>;
  logout: () => void;
  setUser: (user: User) => void;
}

// ─── Student ────────────────────────────────────────────
export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  rollNumber: string;
  department: string;
  semester: number;
  cgpa: number;
  sgpa: number;
  rank: number;
  totalStudents: number;
  attendance: number;
  subjects: string[];
  joinedAt: string;
}

export interface UpdateStudentInput {
  attendance?: number;
  rank?: number;
  cgpa?: number;
  sgpa?: number;
  semester?: number;
  department?: string;
}

// ─── Teacher ────────────────────────────────────────────
export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
  subjects: string[];
  experience: number;
  totalStudents: number;
  joinedAt: string;
}

// ─── Subject ────────────────────────────────────────────
export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  semester: number;
  credits: number;
  teacherId: string;
}

// ─── Assignment ─────────────────────────────────────────
export type AssignmentStatus = "pending" | "submitted" | "graded" | "overdue";

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dueDate: string;
  createdAt: string;
  maxMarks: number;
  status?: AssignmentStatus;
  totalSubmissions?: number;
  totalStudents?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  fileName: string;
  fileSize: string;
  fileUrl?: string;
  marks?: number;
  maxMarks: number;
  feedback?: string;
  status: "submitted" | "graded";
}

// ─── Marks ──────────────────────────────────────────────
export interface Mark {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  credits: number;
  semester: number;
  internalMarks: number;
  externalMarks: number;
  totalMarks: number;
  maxMarks: number;
  grade: string;
  gradePoint: number;
}

export interface UpsertMarkInput {
  studentId: string;
  subjectId: string;
  semester: number;
  internalMarks: number;
  externalMarks: number;
}

export interface SemesterResult {
  semester: number;
  sgpa: number;
  cgpa: number;
  totalCredits: number;
  earnedCredits: number;
  marks: Mark[];
}

// ─── Notification ───────────────────────────────────────
export type NotificationType = "assignment" | "deadline" | "grade" | "announcement" | "mentor" | "alert";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

// ─── Mentor ─────────────────────────────────────────────
export interface MentorPairing {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  mentorCgpa: number;
  menteeId: string;
  menteeName: string;
  menteeAvatar: string;
  menteeCgpa: number;
  subject: string;
  subjectId: string;
  status: "suggested" | "active" | "completed" | "rejected";
  reason: string;
  mentorUserId?: string;
  menteeUserId?: string;
}

// ─── Analytics ──────────────────────────────────────────
export interface PerformanceTrend {
  semester: string;
  sgpa: number;
  cgpa: number;
}

export interface SubjectPerformance {
  subject: string;
  score: number;
  average: number;
}

export interface WeakStudent {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  cgpa: number;
  weakSubjects: string[];
  riskLevel: "high" | "medium" | "low";
  trend: "declining" | "stable" | "improving";
}

// ─── Announcement ───────────────────────────────────────
export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "urgent";
  teacherId: string;
  teacherName: string;
  createdAt: string;
  targetAudience: "all" | "department" | "class";
}

// ─── Calendar Event ─────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "assignment" | "exam" | "holiday" | "event";
  color: string;
}

// ─── Dashboard Stats ────────────────────────────────────
export interface StatCardData {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
}
