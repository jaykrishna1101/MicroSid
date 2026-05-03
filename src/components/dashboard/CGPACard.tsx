"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

interface CGPACardProps {
  cgpa: number;
  sgpa: number;
  rank: number;
  totalStudents: number;
}

export function CGPACard({ cgpa, sgpa, rank, totalStudents }: CGPACardProps) {
  const percentage = (cgpa / 10) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-xl border border-border bg-card p-6 flex flex-col items-center text-center"
    >
      <h3 className="text-lg font-semibold mb-4">CGPA Overview</h3>

      {/* Circular Progress */}
      <div className="relative w-36 h-36 mb-4">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="42" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
          <motion.circle
            cx="50" cy="50" r="42"
            stroke="#6366f1"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 42}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100) }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold">{cgpa}</span>
          <span className="text-xs text-muted-foreground">CGPA</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">SGPA</p>
          <p className="text-xl font-bold">{sgpa}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Rank</p>
          <p className="text-xl font-bold">{rank}<span className="text-sm text-muted-foreground">/{totalStudents}</span></p>
        </div>
      </div>
    </motion.div>
  );
}
