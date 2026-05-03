"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Loader2, Users } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getStudents, updateStudent } from "@/services/api";
import { toast } from "sonner";
import type { Student } from "@/types";

interface EditableRow {
  cgpa: number;
  sgpa: number;
  attendance: number;
  rank: number;
  semester: number;
  dirty: boolean;
}

export default function TeacherStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [edits, setEdits] = useState<Record<string, EditableRow>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    getStudents().then((s) => {
      setStudents(s);
      const e: Record<string, EditableRow> = {};
      for (const st of s) {
        e[st.id] = { cgpa: st.cgpa, sgpa: st.sgpa, attendance: st.attendance, rank: st.rank, semester: st.semester, dirty: false };
      }
      setEdits(e);
    }).catch(() => {});
  }, []);

  const update = (id: string, field: keyof Omit<EditableRow, "dirty">, value: number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value, dirty: true } }));
  };

  const handleSave = async (studentId: string) => {
    const e = edits[studentId];
    if (!e) return;
    setSavingId(studentId);
    try {
      await updateStudent(studentId, {
        cgpa: e.cgpa, sgpa: e.sgpa, attendance: e.attendance, rank: e.rank, semester: e.semester,
      });
      setEdits(prev => ({ ...prev, [studentId]: { ...prev[studentId], dirty: false } }));
      toast.success("Student data updated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="h-8 w-8" /> Manage Students</h1>
        <p className="text-muted-foreground mt-1">Edit student academic data — changes reflect on student dashboards</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="pt-6">
            {students.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students found.</p>
            ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll No</TableHead>
                  <TableHead className="text-center">Semester</TableHead>
                  <TableHead className="text-center">CGPA</TableHead>
                  <TableHead className="text-center">SGPA</TableHead>
                  <TableHead className="text-center">Attendance %</TableHead>
                  <TableHead className="text-center">Rank</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {students.map((s) => {
                    const e = edits[s.id];
                    if (!e) return null;
                    return (
                      <TableRow key={s.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback></Avatar>
                            <div>
                              <p className="font-medium text-sm">{s.name}</p>
                              <p className="text-xs text-muted-foreground">{s.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{s.rollNumber}</TableCell>
                        <TableCell><Input type="number" min={1} max={8} className="w-16 mx-auto text-center" value={e.semester} onChange={(ev) => update(s.id, "semester", Number(ev.target.value))} /></TableCell>
                        <TableCell><Input type="number" min={0} max={10} step={0.1} className="w-20 mx-auto text-center" value={e.cgpa} onChange={(ev) => update(s.id, "cgpa", Number(ev.target.value))} /></TableCell>
                        <TableCell><Input type="number" min={0} max={10} step={0.1} className="w-20 mx-auto text-center" value={e.sgpa} onChange={(ev) => update(s.id, "sgpa", Number(ev.target.value))} /></TableCell>
                        <TableCell><Input type="number" min={0} max={100} step={0.1} className="w-20 mx-auto text-center" value={e.attendance} onChange={(ev) => update(s.id, "attendance", Number(ev.target.value))} /></TableCell>
                        <TableCell><Input type="number" min={0} className="w-16 mx-auto text-center" value={e.rank} onChange={(ev) => update(s.id, "rank", Number(ev.target.value))} /></TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant={e.dirty ? "default" : "outline"} disabled={!e.dirty || savingId === s.id} onClick={() => handleSave(s.id)}>
                            {savingId === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
