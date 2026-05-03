"use client";

import { CalendarWidget } from "@/components/dashboard/CalendarWidget";
import { motion } from "framer-motion";

export default function StudentCalendar() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground mt-1">Keep track of important dates and deadlines</p>
      </motion.div>
      <div className="max-w-lg">
        <CalendarWidget />
      </div>
    </div>
  );
}
