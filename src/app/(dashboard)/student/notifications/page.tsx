"use client";

import { motion } from "framer-motion";
import { Bell, BookOpen, AlertCircle, Award, Users, Megaphone, CheckCircle2 } from "lucide-react";
import { useNotificationStore } from "@/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from "date-fns";
import type { NotificationType } from "@/types";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";

const typeConfig: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  assignment: { icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  deadline: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
  grade: { icon: Award, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  announcement: { icon: Megaphone, color: "text-purple-500", bg: "bg-purple-500/10" },
  mentor: { icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  alert: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function StudentNotifications() {
  const { notifications, markRead, markAllRead, unreadCount } = useNotificationStore();

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead}>
          <CheckCircle2 className="h-4 w-4 mr-1" /> Mark all read
        </Button>
      </motion.div>

      <StaggerContainer className="space-y-3">
        {notifications.map((n) => {
          const config = typeConfig[n.type];
          const Icon = config.icon;
          return (
            <StaggerItem key={n.id}>
              <div
                onClick={() => markRead(n.id)}
                className={cn(
                  "flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all hover:shadow-sm",
                  !n.isRead ? "bg-primary/5 border-primary/20" : "border-border"
                )}
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg shrink-0", config.bg)}>
                  <Icon className={cn("h-5 w-5", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", !n.isRead && "font-semibold")}>{n.title}</p>
                    {!n.isRead && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}</p>
                </div>
                <Badge variant="outline" className="capitalize text-xs shrink-0">{n.type}</Badge>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </div>
  );
}
