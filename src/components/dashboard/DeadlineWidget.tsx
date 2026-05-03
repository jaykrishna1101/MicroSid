"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAssignments } from "@/services/api";
import { differenceInDays, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Assignment } from "@/types";

export function DeadlineWidget() {
  const [upcoming, setUpcoming] = useState<Assignment[]>([]);

  useEffect(() => {
    getAssignments().then(all => {
      const filtered = all
        .filter(a => a.status === "pending")
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 4);
      setUpcoming(filtered);
    }).catch(() => {});
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        <Clock className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming deadlines.</p> : upcoming.map((a, i) => {
          const daysLeft = differenceInDays(parseISO(a.dueDate), new Date());
          const isUrgent = daysLeft <= 2;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
              className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", isUrgent ? "border-destructive/30 bg-destructive/5" : "border-border")}>
              {isUrgent && <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.subjectName}</p>
              </div>
              <Badge variant={isUrgent ? "destructive" : "secondary"} className="shrink-0">{daysLeft <= 0 ? "Today" : `${daysLeft}d left`}</Badge>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
