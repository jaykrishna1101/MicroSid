"use client";

import { useEffect, useState } from "react";
import { BookOpen, Award, TrendingUp, Calendar, ClipboardList, Target } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { PerformanceTrendChart } from "@/components/dashboard/PerformanceTrendChart";
import { CGPACard } from "@/components/dashboard/CGPACard";
import { DeadlineWidget } from "@/components/dashboard/DeadlineWidget";
import { ClassComparisonChart } from "@/components/dashboard/ClassComparisonChart";
import { NotificationPanel } from "@/components/dashboard/NotificationPanel";
import { MentorSuggestionWidget } from "@/components/dashboard/MentorSuggestionWidget";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { LeaderboardWidget } from "@/components/dashboard/LeaderboardWidget";
import { getCurrentStudent, getAssignments } from "@/services/api";
import { motion } from "framer-motion";
import type { Student, Assignment } from "@/types";

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [allAssignments, setAllAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    getCurrentStudent().then(setStudent).catch(() => {});
    getAssignments().then(setAllAssignments).catch(() => {});
  }, []);

  const pendingAssignments = allAssignments.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">{student?.name?.split(" ")[0] || "Student"}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s your academic overview for this semester.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="CGPA" value={student?.cgpa?.toFixed(1) || "—"} icon={Award} index={0} gradient="bg-gradient-to-br from-indigo-500 to-purple-600" />
        <StatCard title="Pending Assignments" value={pendingAssignments} icon={ClipboardList} index={1} gradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title="Class Rank" value={student?.rank ? `#${student.rank}` : "—"} icon={TrendingUp} index={2} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard title="Attendance" value={student?.attendance ? `${student.attendance}%` : "—"} icon={Calendar} index={3} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><PerformanceTrendChart /></div>
        <CGPACard cgpa={student?.cgpa || 0} sgpa={student?.sgpa || 0} rank={student?.rank || 0} totalStudents={student?.totalStudents || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassComparisonChart />
        <DeadlineWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <NotificationPanel />
        <MentorSuggestionWidget />
        <LeaderboardWidget />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalendarWidget />
      </div>
    </div>
  );
}
