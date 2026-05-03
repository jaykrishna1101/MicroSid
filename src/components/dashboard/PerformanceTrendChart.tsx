"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getPerformanceTrends } from "@/services/api";
import type { PerformanceTrend } from "@/types";

export function PerformanceTrendChart() {
  const [data, setData] = useState<PerformanceTrend[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { 
    setIsMounted(true);
    getPerformanceTrends().then(setData).catch(() => {}); 
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
      <div className="h-72">
        {!isMounted ? null : data.length > 0 ? (
        <ResponsiveContainer width="99%" height="100%" minHeight={288}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="semester" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis domain={[5, 10]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} labelFormatter={(v) => `Semester ${v}`} />
            <Legend />
            <Line type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Your SGPA" />
            <Line type="monotone" dataKey="cgpa" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} name="Your CGPA" />
          </LineChart>
        </ResponsiveContainer>
        ) : <p className="text-muted-foreground text-center pt-24">No trend data yet.</p>}
      </div>
    </motion.div>
  );
}
