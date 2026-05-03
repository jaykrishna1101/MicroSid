import type { Student, Teacher, Subject, Assignment, Mark, Notification, MentorPairing, Submission, Announcement, CalendarEvent, PerformanceTrend, SubjectPerformance, WeakStudent } from "@/types";

// ─── Students ───────────────────────────────────────────
export const students: Student[] = [
  { id: "s1", userId: "u1", name: "Arjun Mehta", email: "arjun@edu.com", avatar: "AM", rollNumber: "CS2101", department: "Computer Science", semester: 5, cgpa: 8.7, sgpa: 8.9, rank: 3, totalStudents: 60, attendance: 92, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s2", userId: "u2", name: "Priya Sharma", email: "priya@edu.com", avatar: "PS", rollNumber: "CS2102", department: "Computer Science", semester: 5, cgpa: 9.2, sgpa: 9.4, rank: 1, totalStudents: 60, attendance: 96, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s3", userId: "u3", name: "Rahul Verma", email: "rahul@edu.com", avatar: "RV", rollNumber: "CS2103", department: "Computer Science", semester: 5, cgpa: 6.4, sgpa: 6.1, rank: 42, totalStudents: 60, attendance: 74, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s4", userId: "u4", name: "Sneha Iyer", email: "sneha@edu.com", avatar: "SI", rollNumber: "CS2104", department: "Computer Science", semester: 5, cgpa: 7.8, sgpa: 7.5, rank: 15, totalStudents: 60, attendance: 88, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s5", userId: "u5", name: "Karan Singh", email: "karan@edu.com", avatar: "KS", rollNumber: "CS2105", department: "Computer Science", semester: 5, cgpa: 5.9, sgpa: 5.5, rank: 51, totalStudents: 60, attendance: 65, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s6", userId: "u6", name: "Ananya Reddy", email: "ananya@edu.com", avatar: "AR", rollNumber: "CS2106", department: "Computer Science", semester: 5, cgpa: 9.0, sgpa: 9.1, rank: 2, totalStudents: 60, attendance: 94, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s7", userId: "u7", name: "Dev Patel", email: "dev@edu.com", avatar: "DP", rollNumber: "CS2107", department: "Computer Science", semester: 5, cgpa: 7.2, sgpa: 7.0, rank: 22, totalStudents: 60, attendance: 82, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
  { id: "s8", userId: "u8", name: "Nisha Gupta", email: "nisha@edu.com", avatar: "NG", rollNumber: "CS2108", department: "Computer Science", semester: 5, cgpa: 8.4, sgpa: 8.6, rank: 5, totalStudents: 60, attendance: 90, subjects: ["sub1","sub2","sub3","sub4","sub5"], joinedAt: "2023-08-01" },
];

// ─── Teachers ───────────────────────────────────────────
export const teachers: Teacher[] = [
  { id: "t1", userId: "ut1", name: "Dr. Anil Kumar", email: "anil@edu.com", avatar: "AK", department: "Computer Science", subjects: ["sub1","sub2"], experience: 12, totalStudents: 120, joinedAt: "2018-01-15" },
  { id: "t2", userId: "ut2", name: "Prof. Sunita Rao", email: "sunita@edu.com", avatar: "SR", department: "Computer Science", subjects: ["sub3","sub4"], experience: 8, totalStudents: 90, joinedAt: "2020-06-01" },
  { id: "t3", userId: "ut3", name: "Dr. Rajesh Nair", email: "rajesh@edu.com", avatar: "RN", department: "Computer Science", subjects: ["sub5"], experience: 15, totalStudents: 60, joinedAt: "2015-03-20" },
];

// ─── Subjects ───────────────────────────────────────────
export const subjects: Subject[] = [
  { id: "sub1", name: "Data Structures & Algorithms", code: "CS301", department: "Computer Science", semester: 5, credits: 4, teacherId: "t1" },
  { id: "sub2", name: "Database Management Systems", code: "CS302", department: "Computer Science", semester: 5, credits: 4, teacherId: "t1" },
  { id: "sub3", name: "Operating Systems", code: "CS303", department: "Computer Science", semester: 5, credits: 3, teacherId: "t2" },
  { id: "sub4", name: "Computer Networks", code: "CS304", department: "Computer Science", semester: 5, credits: 3, teacherId: "t2" },
  { id: "sub5", name: "Software Engineering", code: "CS305", department: "Computer Science", semester: 5, credits: 3, teacherId: "t3" },
];

// ─── Assignments ────────────────────────────────────────
export const assignments: Assignment[] = [
  { id: "a1", title: "Binary Tree Implementation", description: "Implement AVL tree with insert, delete, and search operations.", subjectId: "sub1", subjectName: "Data Structures & Algorithms", teacherId: "t1", teacherName: "Dr. Anil Kumar", dueDate: "2026-05-05", createdAt: "2026-04-20", maxMarks: 100, status: "pending", totalSubmissions: 35, totalStudents: 60 },
  { id: "a2", title: "SQL Query Optimization", description: "Optimize the given set of SQL queries and explain the execution plan.", subjectId: "sub2", subjectName: "Database Management Systems", teacherId: "t1", teacherName: "Dr. Anil Kumar", dueDate: "2026-05-03", createdAt: "2026-04-18", maxMarks: 50, status: "submitted", totalSubmissions: 48, totalStudents: 60 },
  { id: "a3", title: "Process Scheduling Simulator", description: "Build a simulator for FCFS, SJF, Round Robin scheduling algorithms.", subjectId: "sub3", subjectName: "Operating Systems", teacherId: "t2", teacherName: "Prof. Sunita Rao", dueDate: "2026-05-08", createdAt: "2026-04-22", maxMarks: 80, status: "pending", totalSubmissions: 20, totalStudents: 60 },
  { id: "a4", title: "TCP/UDP Socket Programming", description: "Implement a chat application using socket programming.", subjectId: "sub4", subjectName: "Computer Networks", teacherId: "t2", teacherName: "Prof. Sunita Rao", dueDate: "2026-04-28", createdAt: "2026-04-15", maxMarks: 60, status: "overdue", totalSubmissions: 55, totalStudents: 60 },
  { id: "a5", title: "UML Diagrams for E-Commerce", description: "Design use case, class, and sequence diagrams for an e-commerce platform.", subjectId: "sub5", subjectName: "Software Engineering", teacherId: "t3", teacherName: "Dr. Rajesh Nair", dueDate: "2026-05-10", createdAt: "2026-04-25", maxMarks: 40, status: "pending", totalSubmissions: 12, totalStudents: 60 },
  { id: "a6", title: "ER Diagram Design", description: "Design an ER diagram for a university management system.", subjectId: "sub2", subjectName: "Database Management Systems", teacherId: "t1", teacherName: "Dr. Anil Kumar", dueDate: "2026-05-12", createdAt: "2026-04-28", maxMarks: 30, status: "pending", totalSubmissions: 5, totalStudents: 60 },
];

// ─── Submissions ────────────────────────────────────────
export const submissions: Submission[] = [
  { id: "sub1-a1", assignmentId: "a1", studentId: "s1", studentName: "Arjun Mehta", studentAvatar: "AM", submittedAt: "2026-04-30", fileName: "avl_tree.zip", fileSize: "2.4 MB", marks: 88, maxMarks: 100, feedback: "Excellent work!", status: "graded" },
  { id: "sub2-a1", assignmentId: "a1", studentId: "s2", studentName: "Priya Sharma", studentAvatar: "PS", submittedAt: "2026-04-29", fileName: "avl_implementation.zip", fileSize: "1.8 MB", marks: 95, maxMarks: 100, feedback: "Outstanding!", status: "graded" },
  { id: "sub3-a2", assignmentId: "a2", studentId: "s1", studentName: "Arjun Mehta", studentAvatar: "AM", submittedAt: "2026-04-28", fileName: "sql_queries.pdf", fileSize: "450 KB", status: "submitted", maxMarks: 50 },
  { id: "sub4-a2", assignmentId: "a2", studentId: "s3", studentName: "Rahul Verma", studentAvatar: "RV", submittedAt: "2026-05-01", fileName: "queries.sql", fileSize: "120 KB", marks: 32, maxMarks: 50, feedback: "Needs improvement on joins.", status: "graded" },
  { id: "sub5-a3", assignmentId: "a3", studentId: "s4", studentName: "Sneha Iyer", studentAvatar: "SI", submittedAt: "2026-05-02", fileName: "scheduler.py", fileSize: "890 KB", status: "submitted", maxMarks: 80 },
];

// ─── Marks ──────────────────────────────────────────────
export const marks: Mark[] = [
  { id: "m1", studentId: "s1", subjectId: "sub1", subjectName: "Data Structures & Algorithms", subjectCode: "CS301", credits: 4, semester: 5, internalMarks: 38, externalMarks: 72, totalMarks: 82, maxMarks: 100, grade: "A", gradePoint: 8 },
  { id: "m2", studentId: "s1", subjectId: "sub2", subjectName: "Database Management Systems", subjectCode: "CS302", credits: 4, semester: 5, internalMarks: 42, externalMarks: 78, totalMarks: 90, maxMarks: 100, grade: "A+", gradePoint: 9 },
  { id: "m3", studentId: "s1", subjectId: "sub3", subjectName: "Operating Systems", subjectCode: "CS303", credits: 3, semester: 5, internalMarks: 40, externalMarks: 75, totalMarks: 86, maxMarks: 100, grade: "A", gradePoint: 8 },
  { id: "m4", studentId: "s1", subjectId: "sub4", subjectName: "Computer Networks", subjectCode: "CS304", credits: 3, semester: 5, internalMarks: 44, externalMarks: 80, totalMarks: 92, maxMarks: 100, grade: "A+", gradePoint: 9 },
  { id: "m5", studentId: "s1", subjectId: "sub5", subjectName: "Software Engineering", subjectCode: "CS305", credits: 3, semester: 5, internalMarks: 36, externalMarks: 68, totalMarks: 78, maxMarks: 100, grade: "B+", gradePoint: 7 },
  { id: "m6", studentId: "s3", subjectId: "sub1", subjectName: "Data Structures & Algorithms", subjectCode: "CS301", credits: 4, semester: 5, internalMarks: 22, externalMarks: 40, totalMarks: 52, maxMarks: 100, grade: "C", gradePoint: 5 },
  { id: "m7", studentId: "s3", subjectId: "sub2", subjectName: "Database Management Systems", subjectCode: "CS302", credits: 4, semester: 5, internalMarks: 28, externalMarks: 45, totalMarks: 58, maxMarks: 100, grade: "C", gradePoint: 5 },
  { id: "m8", studentId: "s5", subjectId: "sub1", subjectName: "Data Structures & Algorithms", subjectCode: "CS301", credits: 4, semester: 5, internalMarks: 18, externalMarks: 35, totalMarks: 45, maxMarks: 100, grade: "D", gradePoint: 4 },
];

// ─── Notifications ──────────────────────────────────────
export const notifications: Notification[] = [
  { id: "n1", title: "Assignment Due Tomorrow", message: "Binary Tree Implementation is due on May 5th.", type: "deadline", isRead: false, createdAt: "2026-05-01T08:00:00", link: "/student/assignments" },
  { id: "n2", title: "New Grade Posted", message: "Your SQL Query Optimization assignment has been graded.", type: "grade", isRead: false, createdAt: "2026-04-30T14:30:00", link: "/student/marks" },
  { id: "n3", title: "Mentor Suggestion", message: "Priya Sharma has been suggested as your mentor for DSA.", type: "mentor", isRead: true, createdAt: "2026-04-29T10:00:00", link: "/student/mentors" },
  { id: "n4", title: "New Assignment", message: "ER Diagram Design has been posted for DBMS.", type: "assignment", isRead: false, createdAt: "2026-04-28T09:00:00", link: "/student/assignments" },
  { id: "n5", title: "Class Announcement", message: "Mid-semester exam schedule has been published.", type: "announcement", isRead: true, createdAt: "2026-04-27T16:00:00" },
  { id: "n6", title: "Performance Alert", message: "Your performance in OS has dropped below class average.", type: "alert", isRead: false, createdAt: "2026-04-26T11:00:00", link: "/student/analytics" },
];

// ─── Mentor Pairings ────────────────────────────────────
export const mentorPairings: MentorPairing[] = [
  { id: "mp1", mentorId: "s2", mentorName: "Priya Sharma", mentorAvatar: "PS", mentorCgpa: 9.2, menteeId: "s3", menteeName: "Rahul Verma", menteeAvatar: "RV", menteeCgpa: 6.4, subject: "Data Structures & Algorithms", subjectId: "sub1", status: "active", reason: "Rahul scored below class average in DSA. Priya is the top performer." },
  { id: "mp2", mentorId: "s6", mentorName: "Ananya Reddy", mentorAvatar: "AR", mentorCgpa: 9.0, menteeId: "s5", menteeName: "Karan Singh", menteeAvatar: "KS", menteeCgpa: 5.9, subject: "Database Management Systems", subjectId: "sub2", status: "suggested", reason: "Karan needs help in DBMS. Ananya excels in the subject." },
  { id: "mp3", mentorId: "s8", mentorName: "Nisha Gupta", mentorAvatar: "NG", mentorCgpa: 8.4, menteeId: "s7", menteeName: "Dev Patel", menteeAvatar: "DP", menteeCgpa: 7.2, subject: "Operating Systems", subjectId: "sub3", status: "suggested", reason: "Dev could benefit from Nisha's strong OS fundamentals." },
];

// ─── Announcements ──────────────────────────────────────
export const announcements: Announcement[] = [
  { id: "ann1", title: "Mid-Semester Exam Schedule", message: "Mid-semester examinations will begin from May 15th. Detailed schedule available on the portal.", priority: "high", teacherId: "t1", teacherName: "Dr. Anil Kumar", createdAt: "2026-04-27", targetAudience: "all" },
  { id: "ann2", title: "Lab Session Rescheduled", message: "Thursday's DBMS lab has been moved to Friday 2-4 PM.", priority: "medium", teacherId: "t1", teacherName: "Dr. Anil Kumar", createdAt: "2026-04-26", targetAudience: "class" },
  { id: "ann3", title: "Guest Lecture on AI", message: "A guest lecture on AI in Healthcare will be held on May 8th in the auditorium.", priority: "low", teacherId: "t3", teacherName: "Dr. Rajesh Nair", createdAt: "2026-04-25", targetAudience: "department" },
];

// ─── Performance Trends ─────────────────────────────────
export const performanceTrends: PerformanceTrend[] = [
  { semester: "Sem 1", sgpa: 7.8, cgpa: 7.8 },
  { semester: "Sem 2", sgpa: 8.2, cgpa: 8.0 },
  { semester: "Sem 3", sgpa: 8.5, cgpa: 8.2 },
  { semester: "Sem 4", sgpa: 8.9, cgpa: 8.4 },
  { semester: "Sem 5", sgpa: 8.7, cgpa: 8.5 },
];

// ─── Subject Performance ────────────────────────────────
export const subjectPerformances: SubjectPerformance[] = [
  { subject: "DSA", score: 82, average: 68 },
  { subject: "DBMS", score: 90, average: 72 },
  { subject: "OS", score: 86, average: 70 },
  { subject: "CN", score: 92, average: 74 },
  { subject: "SE", score: 78, average: 71 },
];

// ─── Weak Students ──────────────────────────────────────
export const weakStudents: WeakStudent[] = [
  { studentId: "s5", studentName: "Karan Singh", studentAvatar: "KS", cgpa: 5.9, weakSubjects: ["DSA", "DBMS", "OS"], riskLevel: "high", trend: "declining" },
  { studentId: "s3", studentName: "Rahul Verma", studentAvatar: "RV", cgpa: 6.4, weakSubjects: ["DSA", "DBMS"], riskLevel: "medium", trend: "stable" },
  { studentId: "s7", studentName: "Dev Patel", studentAvatar: "DP", cgpa: 7.2, weakSubjects: ["OS"], riskLevel: "low", trend: "improving" },
];

// ─── Calendar Events ────────────────────────────────────
export const calendarEvents: CalendarEvent[] = [
  { id: "ce1", title: "DSA Assignment Due", date: "2026-05-05", type: "assignment", color: "#6366f1" },
  { id: "ce2", title: "DBMS Lab Test", date: "2026-05-08", type: "exam", color: "#ef4444" },
  { id: "ce3", title: "Mid-Sem Exams Begin", date: "2026-05-15", type: "exam", color: "#ef4444" },
  { id: "ce4", title: "Guest Lecture", date: "2026-05-08", type: "event", color: "#22c55e" },
  { id: "ce5", title: "OS Assignment Due", date: "2026-05-08", type: "assignment", color: "#6366f1" },
  { id: "ce6", title: "SE Assignment Due", date: "2026-05-10", type: "assignment", color: "#6366f1" },
  { id: "ce7", title: "ER Diagram Due", date: "2026-05-12", type: "assignment", color: "#6366f1" },
  { id: "ce8", title: "Foundation Day", date: "2026-05-20", type: "holiday", color: "#f59e0b" },
];
