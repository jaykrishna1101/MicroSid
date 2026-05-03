"use client";

import { motion } from "framer-motion";
import { Bell, CheckCircle2, AlertCircle, BookOpen, Award, Users, Megaphone } from "lucide-react";
import { useNotificationStore } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { NotificationType } from "@/types";

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string }> = {
  assignment: { icon: BookOpen, color: "text-blue-500" },
  deadline: { icon: AlertCircle, color: "text-orange-500" },
  grade: { icon: Award, color: "text-emerald-500" },
  announcement: { icon: Megaphone, color: "text-purple-500" },
  mentor: { icon: Users, color: "text-indigo-500" },
  alert: { icon: AlertCircle, color: "text-red-500" },
};

export function NotificationPanel() {
  const { notifications, markRead, markAllRead } = useNotificationStore();
  const recent = notifications.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="rounded-xl border border-border bg-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs text-muted-foreground">
          Mark all read
        </Button>
      </div>
      <ScrollArea className="h-64">
        <div className="space-y-2">
          {recent.map((n, i) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-colors hover:bg-muted/50",
                  !n.isRead && "bg-primary/5"
                )}
              >
                <div className={cn("mt-0.5 shrink-0", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium truncate", !n.isRead && "font-semibold")}>{n.title}</p>
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
