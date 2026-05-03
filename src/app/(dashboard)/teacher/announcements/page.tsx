"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, Plus, Send, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAnnouncements, createAnnouncement } from "@/services/api";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";
import type { Announcement } from "@/types";

const priorityColors: Record<string, string> = {
  low: "bg-blue-500/10 text-blue-600", medium: "bg-yellow-500/10 text-yellow-600",
  high: "bg-orange-500/10 text-orange-600", urgent: "bg-red-500/10 text-red-600",
};

export default function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", priority: "medium", audience: "all" });

  useEffect(() => { getAnnouncements().then(setAnnouncements).catch(() => {}); }, []);

  const handleSend = async () => {
    if (!form.title || !form.message) { toast.error("Please fill in title and message."); return; }
    setSending(true);
    try {
      await createAnnouncement({
        title: form.title,
        message: form.message,
        priority: form.priority as any,
        targetAudience: form.audience as any,
      });
      toast.success("Announcement sent!");
      setIsOpen(false);
      setForm({ title: "", message: "", priority: "medium", audience: "all" });
      getAnnouncements().then(setAnnouncements).catch(() => {});
    } catch (e: any) {
      toast.error(e.message || "Failed to send announcement");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="text-muted-foreground mt-1">Send important updates to your students</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" /> New Announcement</DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Create Announcement</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Title</Label><Input placeholder="Announcement title" className="mt-1" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Message</Label><Textarea placeholder="Write your announcement..." className="mt-1" rows={4} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v ?? form.priority })}><SelectTrigger className="mt-1"><SelectValue>{{ low: "Low", medium: "Medium", high: "High", urgent: "Urgent" }[form.priority] || "Medium"}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Audience</Label>
                  <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v ?? form.audience })}><SelectTrigger className="mt-1"><SelectValue>{{ all: "All Students", department: "Department", class: "My Class Only" }[form.audience] || "All Students"}</SelectValue></SelectTrigger>
                    <SelectContent><SelectItem value="all">All Students</SelectItem><SelectItem value="department">Department</SelectItem><SelectItem value="class">My Class Only</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleSend} disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {announcements.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No announcements yet.</p>
      ) : (
      <StaggerContainer className="space-y-4">
        {announcements.map((a) => (
          <StaggerItem key={a.id}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10 shrink-0"><Megaphone className="h-5 w-5 text-purple-500" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{a.title}</h3>
                      <Badge variant="outline" className={priorityColors[a.priority]}>{a.priority}</Badge>
                      <Badge variant="secondary" className="text-xs capitalize">{a.targetAudience}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {a.createdAt ? (() => { try { return format(parseISO(a.createdAt), "MMM d, yyyy"); } catch { return a.createdAt; } })() : ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
      )}
    </div>
  );
}
