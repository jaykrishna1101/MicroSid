"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ClipboardList, FileCheck, TrendingDown, Megaphone } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { getCurrentTeacher, getAssignments, getSubmissions, getWeakStudents, getAnnouncements, getStudents } from "@/services/api";
import type { Teacher, Assignment, WeakStudent, Announcement } from "@/types";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [allAssignments, setAssignments] = useState<Assignment[]>([]);
  const [pendingGrading, setPendingGrading] = useState(0);
  const [weak, setWeak] = useState<WeakStudent[]>([]);
  const [anns, setAnns] = useState<Announcement[]>([]);
  const [classPerformance, setClassPerformance] = useState<{range:string;count:number;color:string}[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    getCurrentTeacher().then(setTeacher).catch(() => {});
    getAssignments().then(setAssignments).catch(() => {});
    getSubmissions().then(subs => { setPendingGrading(subs.filter(s => s.status === "submitted").length); }).catch(() => {});
    getWeakStudents().then(setWeak).catch(() => {});
    getAnnouncements().then(setAnns).catch(() => {});
    getStudents().then(students => {
      const ranges = [
        { range: "9-10", count: students.filter(s => s.cgpa >= 9).length, color: "#22c55e" },
        { range: "8-9", count: students.filter(s => s.cgpa >= 8 && s.cgpa < 9).length, color: "#6366f1" },
        { range: "7-8", count: students.filter(s => s.cgpa >= 7 && s.cgpa < 8).length, color: "#3b82f6" },
        { range: "6-7", count: students.filter(s => s.cgpa >= 6 && s.cgpa < 7).length, color: "#f59e0b" },
        { range: "Below 6", count: students.filter(s => s.cgpa < 6).length, color: "#ef4444" },
      ];
      setClassPerformance(ranges);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">
          Hello, <span className="bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">{teacher?.name || "Teacher"}</span> 👋
        </h1>
        <p className="text-muted-foreground">Here&apos;s your class overview</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={teacher?.totalStudents || 0} icon={Users} index={0} gradient="bg-gradient-to-br from-indigo-500 to-purple-600" />
        <StatCard title="Active Assignments" value={allAssignments.length} icon={ClipboardList} index={1} gradient="bg-gradient-to-br from-orange-500 to-red-500" />
        <StatCard title="Pending Grading" value={pendingGrading} icon={FileCheck} index={2} gradient="bg-gradient-to-br from-yellow-500 to-amber-600" />
        <StatCard title="At-Risk Students" value={weak.length} icon={TrendingDown} index={3} gradient="bg-gradient-to-br from-red-500 to-rose-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Class CGPA Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {!isMounted ? null : classPerformance.some(c => c.count > 0) ? (
                <ResponsiveContainer width="99%" height="100%" minHeight={288}>
                  <BarChart data={classPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]}>{classPerformance.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center pt-24">No student data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500" /> At-Risk Students</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {weak.length === 0 ? <p className="text-sm text-muted-foreground">No at-risk students detected.</p> : weak.map((ws, i) => (
                <motion.div key={ws.studentId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-red-500/20 text-red-600 text-xs font-semibold">{ws.studentAvatar}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{ws.studentName}</p>
                    <p className="text-xs text-muted-foreground">CGPA: {ws.cgpa}</p>
                  </div>
                  <Badge variant={ws.riskLevel === "high" ? "destructive" : "secondary"} className="text-xs">{ws.riskLevel}</Badge>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5" /> Recent Announcements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {anns.length === 0 ? <p className="text-sm text-muted-foreground">No announcements yet.</p> : anns.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{a.title}</p>
                    <Badge variant={a.priority === "high" || a.priority === "urgent" ? "destructive" : "secondary"} className="text-xs">{a.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{a.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
