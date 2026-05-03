"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPerformanceTrends, getSubjectPerformances } from "@/services/api";
import type { PerformanceTrend, SubjectPerformance } from "@/types";

export default function StudentAnalytics() {
  const [trends, setTrends] = useState<PerformanceTrend[]>([]);
  const [subjects, setSubjects] = useState<SubjectPerformance[]>([]);

  useEffect(() => {
    getPerformanceTrends().then(setTrends).catch(() => {});
    getSubjectPerformances().then(setSubjects).catch(() => {});
  }, []);

  const radarData = subjects.map(s => ({ subject: s.subject, you: Math.round((s.score / 150) * 100), classAvg: Math.round((s.average / 150) * 100) }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground mt-1">Deep dive into your academic performance</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader><CardTitle>SGPA Trend Over Semesters</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {trends.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="semester" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis domain={[5, 10]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="SGPA" />
                    <Line type="monotone" dataKey="cgpa" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="CGPA" />
                  </LineChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center pt-24">No trend data available yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader><CardTitle>Subject-wise Radar</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar name="Your Score" dataKey="you" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Radar name="Class Average" dataKey="classAvg" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                    <Legend /><Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center pt-24">No subject data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Subject-wise Performance Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                {subjects.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjects} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="subject" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Legend />
                    <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Your Score" />
                    <Bar dataKey="average" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Class Average" />
                  </BarChart>
                </ResponsiveContainer>
                ) : <p className="text-muted-foreground text-center pt-24">No comparison data yet.</p>}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
