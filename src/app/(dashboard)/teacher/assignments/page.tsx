"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getAssignments, getSubjects, createAssignment, getCurrentTeacher } from "@/services/api";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";
import type { Assignment, Subject } from "@/types";

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: "", subjectId: "", description: "", maxMarks: "100", dueDate: "" });

  useEffect(() => {
    getAssignments().then(setAssignments).catch(() => {});
    getSubjects().then(setSubjects).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) {
      toast.error("Please fill in title, subject, and due date.");
      return;
    }
    setIsSubmitting(true);
    try {
      const teacher = await getCurrentTeacher();
      const newAssignment = await createAssignment({
        title: formData.title,
        subjectId: formData.subjectId,
        description: formData.description,
        maxMarks: Number(formData.maxMarks),
        dueDate: new Date(formData.dueDate).toISOString(),
        teacherId: teacher.id,
      });
      // Also attach subjectName for the UI
      const subject = subjects.find(s => s.id === formData.subjectId);
      if (subject) newAssignment.subjectName = subject.name;
      
      setAssignments(prev => [...prev, newAssignment]);
      toast.success("Assignment created successfully!");
      setIsOpen(false);
      setFormData({ title: "", subjectId: "", description: "", maxMarks: "100", dueDate: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to create assignment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assignments</h1>
          <p className="text-muted-foreground mt-1">Create and manage assignments</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger render={<Button />}>
              <Plus className="h-4 w-4 mr-2" /> Create Assignment
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>New Assignment</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Title</Label><Input placeholder="Assignment title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="mt-1" /></div>
              <div><Label>Subject</Label>
                <Select value={formData.subjectId} onValueChange={v => v && setFormData({ ...formData, subjectId: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select subject">{subjects.find(s => s.id === formData.subjectId)?.name || "Select subject"}</SelectValue></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Description</Label><Textarea placeholder="Assignment details..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="mt-1" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Max Marks</Label><Input type="number" placeholder="100" value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: e.target.value })} className="mt-1" /></div>
                <div><Label>Due Date</Label><Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="mt-1" /></div>
              </div>
              <Button className="w-full" onClick={handleCreate} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : <><Plus className="h-4 w-4 mr-2" /> Create Assignment</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {assignments.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No assignments yet. Create one above!</p>
      ) : (
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((a) => (
          <StaggerItem key={a.id}>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <Badge variant="secondary">{a.subjectName}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> Due: {format(parseISO(a.dueDate), "MMM d, yyyy")}</span>
                  <span>Marks: {a.maxMarks}</span>
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
