"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Eye, EyeOff } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStudents } from "@/services/api";
import type { Student } from "@/types";

export function LeaderboardWidget() {
  const [visible, setVisible] = useState(true);
  const [sorted, setSorted] = useState<Student[]>([]);
  const medals = ["🥇", "🥈", "🥉"];

  useEffect(() => {
    getStudents().then(s => setSorted([...s].sort((a, b) => b.cgpa - a.cgpa).slice(0, 5))).catch(() => {});
  }, []);

  if (!visible) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Leaderboard</h3>
          <Button variant="ghost" size="sm" onClick={() => setVisible(true)}><Eye className="h-4 w-4 mr-1" /> Show</Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">Leaderboard is hidden</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /><h3 className="text-lg font-semibold">Leaderboard</h3></div>
        <Button variant="ghost" size="sm" onClick={() => setVisible(false)}><EyeOff className="h-4 w-4 mr-1" /> Hide</Button>
      </div>
      <div className="space-y-2">
        {sorted.length === 0 ? <p className="text-sm text-muted-foreground">No students found.</p> : sorted.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.65 + i * 0.08 }} className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted/50 transition-colors">
            <span className="w-6 text-center text-sm">{i < 3 ? medals[i] : `#${i + 1}`}</span>
            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">{s.avatar}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{s.name}</p></div>
            <Badge variant="secondary" className="font-mono">{s.cgpa.toFixed(1)}</Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
