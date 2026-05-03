"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { getWeakStudents, getSubjectPerformances } from "@/services/api";
import type { WeakStudent, SubjectPerformance } from "@/types";

export default function TeacherAnalytics() {
  const [weak, setWeak] = useState<WeakStudent[]>([]);
  const [subjects, setSubjects] = useState<SubjectPerformance[]>([]);

  useEffect(() => {
    getWeakStudents().then(setWeak).catch(() => {});
    getSubjectPerformances().then(setSubjects).catch(() => {});
  }, []);

  const subjectDifficulty = subjects.map(s => ({ subject: s.subject, avgScore: s.average, difficulty: 100 - s.average }));
  const riskDistribution = [
    { name: "High Risk", value: weak.filter(w => w.riskLevel === "high").length, color: "#ef4444" },
    { name: "Medium Risk", value: weak.filter(w => w.riskLevel === "medium").length, color: "#f59e0b" },
    { name: "Low Risk", value: weak.filter(w => w.riskLevel === "low").length, color: "#22c55e" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Class Analytics</h1>
        <p className="text-muted-foreground mt-1">Analyze class performance and identify areas for improvement</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>Subject Difficulty Analysis</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {subjectDifficulty.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectDifficulty} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="subject" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} width={50} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[0, 4, 4, 0]} name="Avg Score" />
                  </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center pt-24">No data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>Student Risk Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                {riskDistribution.some(r => r.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>{riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip /></PieChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground">No risk data.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-orange-500" /> Weak Students — Detailed View</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {weak.length === 0 ? <p className="text-sm text-muted-foreground">No weak students detected.</p> : weak.map((ws) => (
              <div key={ws.studentId} className="flex items-center gap-4 rounded-lg border border-border p-4">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-red-500/20 text-red-600 font-semibold">{ws.studentAvatar}</AvatarFallback></Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ws.studentName}</span>
                    <Badge variant={ws.riskLevel === "high" ? "destructive" : "secondary"} className="text-xs">{ws.riskLevel} risk</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground"><span>CGPA: {ws.cgpa}</span></div>
                  <Progress value={(ws.cgpa / 10) * 100} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
