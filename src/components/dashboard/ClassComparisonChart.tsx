"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getSubjectPerformances } from "@/services/api";
import type { SubjectPerformance } from "@/types";

export function ClassComparisonChart() {
  const [data, setData] = useState<SubjectPerformance[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => { 
    setIsMounted(true);
    getSubjectPerformances().then(setData).catch(() => {}); 
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Subject Performance vs Class Average</h3>
      <div className="h-72">
        {!isMounted ? null : data.length > 0 ? (
        <ResponsiveContainer width="99%" height="100%" minHeight={288}>
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="subject" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
            <Legend />
            <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Your Score" />
            <Bar dataKey="average" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Class Average" />
          </BarChart>
        </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center pt-24">No data yet.</p>}
      </div>
    </motion.div>
  );
}
