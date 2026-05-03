import { createClient } from "@/lib/supabase";
import type {
  User, LoginCredentials, SignupData, Assignment, Submission,
  Mark, Notification, MentorPairing, Announcement,
  PerformanceTrend, SubjectPerformance, WeakStudent,
  CalendarEvent, Student, Teacher, Subject, UpsertMarkInput, UpdateStudentInput,
} from "@/types";
import { GRADE_POINTS } from "@/lib/constants";

// ─── Auth ───────────────────────────────────────────────
export async function loginUser(creds: LoginCredentials): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email: creds.email, password: creds.password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Login failed: no user returned");

  let { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle();
  if (!profile) {
    const { data: np } = await supabase.from("profiles").insert({
      id: data.user.id, name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
      email: data.user.email, role: data.user.user_metadata?.role || "student",
    }).select("*").single();
    profile = np;
  }
  return {
    id: data.user.id, email: data.user.email!, name: profile?.name || "User",
    role: profile?.role || "student", avatar: profile?.avatar, createdAt: data.user.created_at,
  };
}

export async function signupUser(d: SignupData): Promise<User> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: d.email, password: d.password, options: { data: { name: d.name, role: d.role } },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Signup failed");
  return { id: data.user.id, email: d.email, name: d.name, role: d.role, createdAt: new Date().toISOString() };
}

export async function logoutUser(): Promise<void> { const s = createClient(); await s.auth.signOut(); }

// ─── Students ───────────────────────────────────────────
function mapStudent(s: any): Student {
  return {
    id: s.id, userId: s.user_id, name: s.profiles?.name || "",
    email: s.profiles?.email || "",
    avatar: s.profiles?.avatar || s.profiles?.name?.split(" ").map((w: string) => w[0]).join("") || "U",
    rollNumber: s.roll_number, department: s.department, semester: s.semester,
    cgpa: Number(s.cgpa) || 0, sgpa: Number(s.sgpa) || 0, rank: s.rank || 0,
    totalStudents: 60, attendance: Number(s.attendance) || 0, subjects: [], joinedAt: s.created_at,
  };
}

export async function getStudents(): Promise<Student[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("students").select("*, profiles(name, email, avatar)").order("cgpa", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapStudent);
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const students = await getStudents();
  return students.find((s) => s.id === id || s.userId === id);
}

export async function getCurrentStudent(): Promise<Student> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let { data: row } = await supabase.from("students").select("*, profiles(name, email, avatar)").eq("user_id", user.id).maybeSingle();
  if (!row) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (!profile) {
      await supabase.from("profiles").insert({ id: user.id, name: user.user_metadata?.name || user.email?.split("@")[0] || "User", email: user.email, role: "student" });
    }
    const { data: nr, error } = await supabase.from("students").insert({
      user_id: user.id, roll_number: `STU-${Math.floor(1000 + Math.random() * 9000)}`, department: "Computer Science", semester: 5,
    }).select("*, profiles(name, email, avatar)").single();
    if (error) throw new Error("Failed to auto-create student profile: " + error.message);
    row = nr;
  }
  return mapStudent(row);
}

export async function updateStudent(studentId: string, input: UpdateStudentInput): Promise<void> {
  const supabase = createClient();
  const updateData: any = {};
  if (input.attendance !== undefined) updateData.attendance = input.attendance;
  if (input.rank !== undefined) updateData.rank = input.rank;
  if (input.cgpa !== undefined) updateData.cgpa = input.cgpa;
  if (input.sgpa !== undefined) updateData.sgpa = input.sgpa;
  if (input.semester !== undefined) updateData.semester = input.semester;
  if (input.department !== undefined) updateData.department = input.department;
  const { error } = await supabase.from("students").update(updateData).eq("id", studentId);
  if (error) throw error;
}

// ─── Teachers ───────────────────────────────────────────
export async function getTeachers(): Promise<Teacher[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("teachers").select("*, profiles(name, email, avatar)");
  if (error) throw error;
  return (data || []).map((t: any) => ({
    id: t.id, userId: t.user_id, name: t.profiles?.name || "", email: t.profiles?.email || "",
    avatar: t.profiles?.avatar || t.profiles?.name?.split(" ").map((w: string) => w[0]).join("") || "T",
    department: t.department, subjects: [], experience: t.experience, totalStudents: 60, joinedAt: t.created_at,
  }));
}

export async function getCurrentTeacher(): Promise<Teacher> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let { data: row } = await supabase.from("teachers").select("*, profiles(name, email, avatar)").eq("user_id", user.id).maybeSingle();
  if (!row) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("id", user.id).maybeSingle();
    if (!profile) {
      await supabase.from("profiles").insert({ id: user.id, name: user.user_metadata?.name || user.email?.split("@")[0] || "Teacher", email: user.email, role: "teacher" });
    }
    const { data: nr, error } = await supabase.from("teachers").insert({ user_id: user.id, department: "Computer Science", experience: 0 }).select("*, profiles(name, email, avatar)").single();
    if (error) throw new Error("Failed to auto-create teacher profile: " + error.message);
    row = nr;
  }
  return {
    id: row.id, userId: row.user_id, name: row.profiles?.name || "", email: row.profiles?.email || "",
    avatar: row.profiles?.avatar || row.profiles?.name?.split(" ").map((w: string) => w[0]).join("") || "T",
    department: row.department, subjects: [], experience: row.experience, totalStudents: 60, joinedAt: row.created_at,
  };
}

// ─── Subjects ───────────────────────────────────────────
export async function getSubjects(): Promise<Subject[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("subjects").select("*");
  if (error) throw error;
  return (data || []).map((s: any) => ({ id: s.id, name: s.name, code: s.code, department: s.department, semester: s.semester, credits: s.credits, teacherId: s.teacher_id }));
}

// ─── Assignments ────────────────────────────────────────
export async function getAssignments(forStudent = false): Promise<Assignment[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("assignments").select("*, subjects(name, code), teachers(profiles(name))").order("due_date", { ascending: true });
  if (error) throw error;

  // If called for a student, overlay submission status
  let submissionMap: Record<string, string> = {};
  if (forStudent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studentRow } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
        if (studentRow) {
          const { data: subs } = await supabase.from("submissions").select("assignment_id, status").eq("student_id", studentRow.id);
          for (const s of subs || []) { submissionMap[s.assignment_id] = s.status; }
        }
      }
    } catch { /* ignore */ }
  }

  const now = new Date();
  return (data || []).map((a: any) => {
    const dueDate = new Date(a.due_date);
    let status: Assignment["status"] = "pending";
    if (submissionMap[a.id]) { status = submissionMap[a.id] as any; }
    else if (dueDate < now) { status = "overdue"; }
    return {
      id: a.id, title: a.title, description: a.description || "", subjectId: a.subject_id,
      subjectName: a.subjects?.name || "", teacherId: a.teacher_id, teacherName: a.teachers?.profiles?.name || "",
      dueDate: a.due_date, createdAt: a.created_at, maxMarks: a.max_marks, status, totalSubmissions: 0, totalStudents: 60,
    };
  });
}

export async function createAssignment(input: Partial<Assignment>): Promise<Assignment> {
  const supabase = createClient();
  const { data, error } = await supabase.from("assignments").insert({
    title: input.title, description: input.description, subject_id: input.subjectId,
    teacher_id: input.teacherId, due_date: input.dueDate, max_marks: input.maxMarks || 100,
  }).select().single();
  if (error) throw error;
  return { id: data.id, title: data.title, description: data.description || "", subjectId: data.subject_id, teacherId: data.teacher_id, dueDate: data.due_date, createdAt: data.created_at, maxMarks: data.max_marks, status: "pending", totalSubmissions: 0, totalStudents: 60, subjectName: "", teacherName: "" };
}

// ─── Submissions ────────────────────────────────────────
export async function getSubmissions(assignmentId?: string): Promise<Submission[]> {
  const supabase = createClient();
  let query = supabase.from("submissions").select("*, students(profiles(name, avatar))");
  if (assignmentId) query = query.eq("assignment_id", assignmentId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((s: any) => ({
    id: s.id, assignmentId: s.assignment_id, studentId: s.student_id,
    studentName: s.students?.profiles?.name || "", studentAvatar: s.students?.profiles?.avatar || "U",
    submittedAt: s.submitted_at, fileName: s.file_name || "", fileSize: s.file_size || "",
    fileUrl: s.file_url || "", marks: s.marks, maxMarks: 100, feedback: s.feedback, status: s.status,
  }));
}

export async function submitAssignment(assignmentId: string, file: File): Promise<Submission> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  let { data: student } = await supabase.from("students").select("id").eq("user_id", user.id).maybeSingle();
  if (!student) {
    const s = await getCurrentStudent();
    student = { id: s.id };
  }

  const filePath = `${user.id}/${assignmentId}/${file.name}`;
  const { error: uploadErr } = await supabase.storage.from("submissions").upload(filePath, file, { upsert: true });
  if (uploadErr) throw uploadErr;

  const { data, error } = await supabase.from("submissions").insert({
    assignment_id: assignmentId, student_id: student.id, file_name: file.name,
    file_size: `${(file.size / 1024).toFixed(0)} KB`, file_url: filePath, status: "submitted",
  }).select().single();
  if (error) throw error;
  return { id: data.id, assignmentId, studentId: student.id, studentName: "", studentAvatar: "", submittedAt: data.submitted_at, fileName: file.name, fileSize: `${(file.size / 1024).toFixed(0)} KB`, fileUrl: filePath, maxMarks: 100, status: "submitted" };
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string): Promise<Submission> {
  const supabase = createClient();
  const { data, error } = await supabase.from("submissions").update({ marks, feedback, status: "graded" }).eq("id", submissionId).select().single();
  if (error) throw error;
  return data as unknown as Submission;
}

export async function getSubmissionFileUrl(filePath: string): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.storage.from("submissions").createSignedUrl(filePath, 3600);
  return data?.signedUrl || "";
}

// ─── Marks ──────────────────────────────────────────────
export async function getMarks(studentId?: string): Promise<Mark[]> {
  const supabase = createClient();
  let query = supabase.from("marks").select("*, subjects:subject_id(name, code, credits)");
  if (studentId) query = query.eq("student_id", studentId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((m: any) => ({
    id: m.id, studentId: m.student_id, subjectId: m.subject_id,
    subjectName: m.subjects?.name || "", subjectCode: m.subjects?.code || "",
    credits: m.subjects?.credits || 0, semester: m.semester,
    internalMarks: m.internal_marks, externalMarks: m.external_marks,
    totalMarks: m.total_marks, maxMarks: m.max_marks, grade: m.grade || "", gradePoint: Number(m.grade_point),
  }));
}

function computeGrade(total: number, max: number): { grade: string; gradePoint: number } {
  const pct = (total / max) * 100;
  if (pct >= 90) return { grade: "O", gradePoint: 10 };
  if (pct >= 80) return { grade: "A+", gradePoint: 9 };
  if (pct >= 70) return { grade: "A", gradePoint: 8 };
  if (pct >= 60) return { grade: "B+", gradePoint: 7 };
  if (pct >= 50) return { grade: "B", gradePoint: 6 };
  if (pct >= 40) return { grade: "C", gradePoint: 5 };
  if (pct >= 30) return { grade: "D", gradePoint: 4 };
  return { grade: "F", gradePoint: 0 };
}

export async function upsertMark(input: UpsertMarkInput): Promise<void> {
  const supabase = createClient();
  const total = input.internalMarks + input.externalMarks;
  const max = 150; // 50 internal + 100 external
  const { grade, gradePoint } = computeGrade(total, max);

  // Check if mark exists
  const { data: existing } = await supabase.from("marks").select("id").eq("student_id", input.studentId).eq("subject_id", input.subjectId).maybeSingle();

  if (existing) {
    const { error } = await supabase.from("marks").update({
      internal_marks: input.internalMarks, external_marks: input.externalMarks,
      total_marks: total, max_marks: max, grade, grade_point: gradePoint, semester: input.semester,
    }).eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("marks").insert({
      student_id: input.studentId, subject_id: input.subjectId, semester: input.semester,
      internal_marks: input.internalMarks, external_marks: input.externalMarks,
      total_marks: total, max_marks: max, grade, grade_point: gradePoint,
    });
    if (error) throw error;
  }

  // Recalculate student SGPA/CGPA
  const allMarks = await getMarks(input.studentId);
  if (allMarks.length > 0) {
    let totalCredits = 0, weightedSum = 0;
    for (const m of allMarks) { totalCredits += m.credits; weightedSum += m.credits * m.gradePoint; }
    const cgpa = totalCredits > 0 ? Number((weightedSum / totalCredits).toFixed(2)) : 0;
    const semMarks = allMarks.filter(m => m.semester === input.semester);
    let semCredits = 0, semWeighted = 0;
    for (const m of semMarks) { semCredits += m.credits; semWeighted += m.credits * m.gradePoint; }
    const sgpa = semCredits > 0 ? Number((semWeighted / semCredits).toFixed(2)) : 0;
    await supabase.from("students").update({ cgpa, sgpa }).eq("id", input.studentId);
  }
}

// ─── Notifications ──────────────────────────────────────
export async function getNotifications(): Promise<Notification[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((n: any) => ({ id: n.id, title: n.title, message: n.message, type: n.type, isRead: n.is_read, createdAt: n.created_at, link: n.link }));
}

export async function markNotificationRead(id: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").update({ is_read: true }).eq("id", id);
}

async function createNotification(userId: string, title: string, message: string, type: string): Promise<void> {
  const supabase = createClient();
  await supabase.from("notifications").insert({ user_id: userId, title, message, type });
}

// ─── Mentors ────────────────────────────────────────────
export async function getMentorPairings(): Promise<MentorPairing[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("mentor_pairings").select(`*, mentor:students!mentor_id(id, user_id, cgpa, profiles(name, avatar)), mentee:students!mentee_id(id, user_id, cgpa, profiles(name, avatar)), subjects(name)`);
  if (error) throw error;
  return (data || []).map((mp: any) => ({
    id: mp.id, mentorId: mp.mentor_id, mentorName: mp.mentor?.profiles?.name || "",
    mentorAvatar: mp.mentor?.profiles?.avatar || "M", mentorCgpa: Number(mp.mentor?.cgpa || 0),
    menteeId: mp.mentee_id, menteeName: mp.mentee?.profiles?.name || "",
    menteeAvatar: mp.mentee?.profiles?.avatar || "M", menteeCgpa: Number(mp.mentee?.cgpa || 0),
    subject: mp.subjects?.name || "", subjectId: mp.subject_id, status: mp.status, reason: mp.reason || "",
    mentorUserId: mp.mentor?.user_id, menteeUserId: mp.mentee?.user_id,
  }));
}

export async function updateMentorPairingStatus(id: string, status: "active" | "rejected"): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("mentor_pairings").update({ status }).eq("id", id);
  if (error) throw error;

  // Send notifications to both students
  const { data: pairing } = await supabase.from("mentor_pairings").select(`*, mentor:students!mentor_id(user_id, profiles(name)), mentee:students!mentee_id(user_id, profiles(name))`).eq("id", id).single();
  if (pairing) {
    const mentorUserId = pairing.mentor?.user_id;
    const menteeUserId = pairing.mentee?.user_id;
    const mentorName = pairing.mentor?.profiles?.name || "Mentor";
    const menteeName = pairing.mentee?.profiles?.name || "Mentee";
    if (status === "active") {
      if (mentorUserId) await createNotification(mentorUserId, "Mentor Pairing Approved", `You have been paired as a mentor for ${menteeName}.`, "mentor");
      if (menteeUserId) await createNotification(menteeUserId, "Mentor Pairing Approved", `${mentorName} has been assigned as your mentor.`, "mentor");
    } else {
      if (mentorUserId) await createNotification(mentorUserId, "Mentor Pairing Rejected", `Your mentor pairing with ${menteeName} was not approved.`, "mentor");
      if (menteeUserId) await createNotification(menteeUserId, "Mentor Pairing Rejected", `The mentor pairing with ${mentorName} was not approved.`, "mentor");
    }
  }
}

export async function suggestMentorPairings(): Promise<number> {
  const supabase = createClient();
  const students = await getStudents();
  if (students.length < 2) return 0;

  const avgCgpa = students.reduce((s, st) => s + st.cgpa, 0) / students.length;
  const mentors = students.filter(s => s.cgpa >= avgCgpa).sort((a, b) => b.cgpa - a.cgpa);
  const mentees = students.filter(s => s.cgpa < avgCgpa).sort((a, b) => a.cgpa - b.cgpa);
  if (mentors.length === 0 || mentees.length === 0) return 0;

  // Get existing pairings to avoid duplicates
  const { data: existing } = await supabase.from("mentor_pairings").select("mentor_id, mentee_id");
  const existingSet = new Set((existing || []).map((e: any) => `${e.mentor_id}-${e.mentee_id}`));

  const inserts: any[] = [];
  const pairCount = Math.min(mentors.length, mentees.length);
  for (let i = 0; i < pairCount; i++) {
    const key = `${mentors[i].id}-${mentees[i].id}`;
    if (!existingSet.has(key)) {
      inserts.push({
        mentor_id: mentors[i].id, mentee_id: mentees[i].id, status: "suggested",
        reason: `${mentees[i].name} (CGPA: ${mentees[i].cgpa}) can benefit from ${mentors[i].name}'s guidance (CGPA: ${mentors[i].cgpa})`,
      });
    }
  }
  if (inserts.length > 0) {
    const { error } = await supabase.from("mentor_pairings").insert(inserts);
    if (error) throw error;
  }
  return inserts.length;
}

// ─── Announcements ──────────────────────────────────────
export async function getAnnouncements(): Promise<Announcement[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("announcements").select("*, teachers(profiles(name))").order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map((a: any) => ({ id: a.id, title: a.title, message: a.message, priority: a.priority, teacherId: a.teacher_id, teacherName: a.teachers?.profiles?.name || "", createdAt: a.created_at, targetAudience: a.target_audience }));
}

export async function createAnnouncement(input: Partial<Announcement>): Promise<Announcement> {
  const teacher = await getCurrentTeacher();
  const supabase = createClient();
  const { data, error } = await supabase.from("announcements").insert({ title: input.title, message: input.message, priority: input.priority || "medium", teacher_id: teacher.id, target_audience: input.targetAudience || "all" }).select().single();
  if (error) throw error;
  return data as unknown as Announcement;
}

// ─── Analytics ──────────────────────────────────────────
export async function getPerformanceTrends(): Promise<PerformanceTrend[]> {
  try {
    const student = await getCurrentStudent();
    const marks = await getMarks(student.id);
    if (marks.length === 0) return [];
    const semesters = [...new Set(marks.map(m => m.semester))].sort((a, b) => a - b);
    const trends: PerformanceTrend[] = [];
    let cp = 0, cc = 0;
    for (const sem of semesters) {
      const sm = marks.filter(m => m.semester === sem);
      let sp = 0, sc = 0;
      for (const m of sm) { sp += m.gradePoint * m.credits; sc += m.credits; }
      const sgpa = sc > 0 ? Number((sp / sc).toFixed(2)) : 0;
      cp += sp; cc += sc;
      trends.push({ semester: `Sem ${sem}`, sgpa, cgpa: cc > 0 ? Number((cp / cc).toFixed(2)) : 0 });
    }
    return trends;
  } catch { return []; }
}

export async function getSubjectPerformances(): Promise<SubjectPerformance[]> {
  try {
    const student = await getCurrentStudent();
    const marks = await getMarks(student.id);
    if (marks.length === 0) return [];
    const supabase = createClient();
    const { data: allMarks } = await supabase.from("marks").select("subject_id, total_marks");
    const avgs: Record<string, { total: number; count: number }> = {};
    for (const m of allMarks || []) {
      if (!avgs[m.subject_id]) avgs[m.subject_id] = { total: 0, count: 0 };
      avgs[m.subject_id].total += m.total_marks; avgs[m.subject_id].count += 1;
    }
    return marks.map(m => {
      const ai = avgs[m.subjectId];
      return { subject: m.subjectName || m.subjectCode, score: m.totalMarks, average: ai ? Number((ai.total / ai.count).toFixed(1)) : 75 };
    });
  } catch { return []; }
}

export async function getWeakStudents(): Promise<WeakStudent[]> {
  const students = await getStudents();
  const avgCgpa = students.reduce((s, st) => s + st.cgpa, 0) / (students.length || 1);
  return students.filter((s) => s.cgpa < avgCgpa).map((s) => ({
    studentId: s.id, studentName: s.name, studentAvatar: s.avatar, cgpa: s.cgpa, weakSubjects: [],
    riskLevel: s.cgpa < 6 ? "high" as const : s.cgpa < 7 ? "medium" as const : "low" as const,
    trend: "stable" as const,
  }));
}

export async function getCalendarEvents(): Promise<CalendarEvent[]> {
  const assignments = await getAssignments();
  return assignments.map((a) => ({ id: a.id, title: a.title, date: a.dueDate, type: "assignment" as const, color: "#6366f1" }));
}
