"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, Clock, AlertTriangle, Upload, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getAssignments, submitAssignment } from "@/services/api";
import { cn } from "@/lib/utils";
import { format, parseISO, differenceInDays } from "date-fns";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";
import type { Assignment } from "@/types";

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  submitted: { label: "Submitted", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  graded: { label: "Graded", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
  overdue: { label: "Overdue", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function StudentAssignments() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const loadAssignments = () => { getAssignments(true).then(setAssignments).catch(() => {}); };
  useEffect(() => { loadAssignments(); }, []);

  const filtered = selectedTab === "all" ? assignments : assignments.filter(a => a.status === selectedTab);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground mt-1">Track and submit your assignments</p>
      </motion.div>

      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="all">All ({assignments.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No assignments found.</p>
          ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((a) => (
              <AssignmentCard key={a.id} assignment={a} onSubmitted={loadAssignments} />
            ))}
          </StaggerContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentCard({ assignment: a, onSubmitted }: { assignment: Assignment; onSubmitted: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const sc = statusConfig[a.status || "pending"];
  const Icon = sc.icon;
  const daysLeft = differenceInDays(parseISO(a.dueDate), new Date());

  const handleSubmit = async () => {
    if (!file) { toast.error("Please select a file to upload"); return; }
    setIsSubmitting(true);
    try {
      await submitAssignment(a.id, file);
      toast.success("Assignment submitted successfully!");
      setFile(null);
      setOpen(false);
      onSubmitted();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StaggerItem>
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base">{a.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{a.subjectName}</p>
            </div>
            <Badge className={cn("gap-1", sc.bg, sc.color)} variant="outline">
              <Icon className="h-3 w-3" /> {sc.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Due: {format(parseISO(a.dueDate), "MMM d, yyyy")}</span>
            <span>Max Marks: {a.maxMarks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className={cn("text-xs font-medium", daysLeft <= 2 && daysLeft >= 0 ? "text-destructive" : "text-muted-foreground")}>
              {daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `${daysLeft} days left`}
            </span>
            {(a.status === "pending" || a.status === "overdue") && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={<Button size="sm" className="h-8" />}>
                    <Upload className="h-3 w-3 mr-1" /> Submit
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Submit: {a.title}</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div><Label>Upload File</Label><Input type="file" className="mt-1" onChange={(e) => setFile(e.target.files?.[0] || null)} /></div>
                    <div><Label>Notes (optional)</Label><Textarea placeholder="Any additional notes..." className="mt-1" /></div>
                    <Button className="w-full" disabled={isSubmitting || !file} onClick={handleSubmit}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                      Submit Assignment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  );
}
