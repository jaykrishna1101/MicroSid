"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { getCalendarEvents } from "@/services/api";
import { format, isSameDay, parseISO } from "date-fns";
import type { CalendarEvent } from "@/types";

export function CalendarWidget() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  useEffect(() => { getCalendarEvents().then(setEvents).catch(() => {}); }, []);

  const eventsOnDate = date ? events.filter(e => isSameDay(parseISO(e.date), date)) : [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }} className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-4">Calendar</h3>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md"
        modifiers={{ event: events.map(e => parseISO(e.date)) }}
        modifiersClassNames={{ event: "bg-primary/20 font-bold text-primary" }}
      />
      {eventsOnDate.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Events on {date && format(date, "MMM d")}</p>
          {eventsOnDate.map(e => (
            <div key={e.id} className="flex items-center gap-2 rounded-lg bg-muted/50 p-2">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: e.color }} />
              <span className="text-sm">{e.title}</span>
              <Badge variant="outline" className="ml-auto text-xs capitalize">{e.type}</Badge>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
