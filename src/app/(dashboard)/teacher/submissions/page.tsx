"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSubmissions, getAssignments, gradeSubmission, getSubmissionFileUrl } from "@/services/api";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import type { Submission, Assignment } from "@/types";

export default function TeacherSubmissions() {
  const [selectedAssignment, setSelectedAssignment] = useState("all");
  const [allSubmissions, setAllSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    getSubmissions().then(setAllSubmissions).catch(console.error);
    getAssignments().then(setAssignments).catch(console.error);
  }, []);

  const filtered = selectedAssignment === "all" ? allSubmissions : allSubmissions.filter(s => s.assignmentId === selectedAssignment);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Submissions</h1>
        <p className="text-muted-foreground mt-1">Review and grade student submissions</p>
      </motion.div>
      <div className="flex items-center gap-4">
        <Select value={selectedAssignment} onValueChange={(v) => setSelectedAssignment(v ?? "all")}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Filter by assignment">{selectedAssignment === "all" ? "All Assignments" : assignments.find(a => a.id === selectedAssignment)?.title || "Filter by assignment"}</SelectValue></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            {assignments.map(a => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="pt-6">
            {filtered.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No submissions yet.</p>
            ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Student</TableHead><TableHead>File</TableHead><TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead><TableHead>Marks</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map((sub) => (
                  <SubmissionRow key={sub.id} sub={sub} onGraded={(updated) => {
                    setAllSubmissions(prev => prev.map(s => s.id === updated.id ? { ...s, marks: updated.marks, feedback: updated.feedback, status: "graded" } : s));
                  }} />
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function SubmissionRow({ sub, onGraded }: { sub: Submission; onGraded: (s: { id: string; marks: number; feedback: string }) => void }) {
  const [marks, setMarks] = useState<number>(sub.marks ?? 0);
  const [feedback, setFeedback] = useState<string>(sub.feedback ?? "");
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  const handleGrade = async () => {
    setSaving(true);
    try {
      await gradeSubmission(sub.id, marks, feedback);
      toast.success("Submission graded!");
      onGraded({ id: sub.id, marks, feedback });
      setOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to grade");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!sub.fileUrl) { toast.error("No file available"); return; }
    try {
      const url = await getSubmissionFileUrl(sub.fileUrl);
      if (url) window.open(url, "_blank");
      else toast.error("Could not generate download link");
    } catch { toast.error("Download failed"); }
  };

  return (
    <TableRow>
      <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{sub.studentAvatar}</AvatarFallback></Avatar><span className="font-medium">{sub.studentName}</span></div></TableCell>
      <TableCell>
        <button onClick={handleDownload} className="text-muted-foreground hover:text-primary hover:underline flex items-center gap-1 text-sm">
          <Download className="h-3 w-3" />{sub.fileName} ({sub.fileSize})
        </button>
      </TableCell>
      <TableCell className="text-muted-foreground">{sub.submittedAt ? format(parseISO(sub.submittedAt), "MMM d") : "—"}</TableCell>
      <TableCell><Badge variant={sub.status === "graded" ? "default" : "secondary"}>{sub.status}</Badge></TableCell>
      <TableCell className="font-mono">{sub.marks !== undefined && sub.marks !== null ? `${sub.marks}/${sub.maxMarks}` : "—"}</TableCell>
      <TableCell className="text-right">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button variant="outline" size="sm" />}>{sub.status === "graded" ? "Edit" : "Grade"}</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Grade: {sub.studentName}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div><Label>Marks (out of {sub.maxMarks})</Label><Input type="number" value={marks} max={sub.maxMarks} min={0} className="mt-1" onChange={(e) => setMarks(Math.min(sub.maxMarks, Math.max(0, Number(e.target.value))))} /></div>
              <div><Label>Feedback</Label><Textarea value={feedback} placeholder="Feedback..." className="mt-1" onChange={(e) => setFeedback(e.target.value)} /></div>
              <Button className="w-full" onClick={handleGrade} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Save Grade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  );
}
