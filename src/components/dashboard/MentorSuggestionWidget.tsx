"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getMentorPairings } from "@/services/api";
import type { MentorPairing } from "@/types";

export function MentorSuggestionWidget() {
  const [suggestions, setSuggestions] = useState<MentorPairing[]>([]);
  useEffect(() => { getMentorPairings().then(all => setSuggestions(all.filter(p => p.status === "suggested").slice(0, 3))).catch(() => {}); }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mentor Suggestions</h3>
        <Users className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {suggestions.length === 0 ? <p className="text-sm text-muted-foreground">No suggestions yet.</p> : suggestions.map((mp, i) => (
          <motion.div key={mp.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.1 }} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <Avatar className="h-9 w-9 shrink-0"><AvatarFallback className="bg-emerald-500/20 text-emerald-600 text-xs font-semibold">{mp.mentorAvatar}</AvatarFallback></Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{mp.mentorName}</p>
              <p className="text-xs text-muted-foreground">CGPA: {mp.mentorCgpa} · {mp.subject}</p>
            </div>
            <Badge variant="outline" className="text-xs shrink-0">Suggested</Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
