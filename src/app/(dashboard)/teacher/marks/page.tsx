"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getStudents, getSubjects, getMarks, upsertMark } from "@/services/api";
import { toast } from "sonner";
import type { Student, Subject, Mark } from "@/types";

interface RowData {
  studentId: string;
  internal: number;
  external: number;
}

export default function TeacherMarks() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [rows, setRows] = useState<Record<string, RowData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getStudents().then(setStudents).catch(() => {});
    getSubjects().then((s) => {
      setSubjects(s);
      if (s.length > 0) setSelectedSubject(s[0].id);
    }).catch(() => {});
  }, []);

  // When subject changes, load existing marks
  const loadMarks = useCallback(async () => {
    if (!selectedSubject || students.length === 0) return;
    try {
      // Fetch all marks for this subject
      const allMarks = await getMarks();
      const subjectMarks = allMarks.filter(m => m.subjectId === selectedSubject);
      const newRows: Record<string, RowData> = {};
      for (const s of students) {
        const existing = subjectMarks.find(m => m.studentId === s.id);
        newRows[s.id] = {
          studentId: s.id,
          internal: existing?.internalMarks ?? 0,
          external: existing?.externalMarks ?? 0,
        };
      }
      setRows(newRows);
    } catch { /* ignore */ }
  }, [selectedSubject, students]);

  useEffect(() => { loadMarks(); }, [loadMarks]);

  const updateRow = (studentId: string, field: "internal" | "external", value: number) => {
    setRows(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value },
    }));
  };

  const getTotal = (studentId: string) => {
    const r = rows[studentId];
    return r ? r.internal + r.external : 0;
  };

  const subject = subjects.find(s => s.id === selectedSubject);

  const handleSaveAll = async () => {
    if (!selectedSubject || !subject) return;
    setSaving(true);
    let saved = 0, errors = 0;
    for (const s of students) {
      const r = rows[s.id];
      if (!r) continue;
      try {
        await upsertMark({
          studentId: s.id,
          subjectId: selectedSubject,
          semester: subject.semester,
          internalMarks: r.internal,
          externalMarks: r.external,
        });
        saved++;
      } catch (e: any) {
        errors++;
        console.error(`Failed to save marks for ${s.name}:`, e);
      }
    }
    setSaving(false);
    if (errors > 0) {
      toast.error(`Saved ${saved} marks, ${errors} failed.`);
    } else {
      toast.success(`All ${saved} marks saved and CGPA recalculated!`);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Manage Marks</h1>
        <p className="text-muted-foreground mt-1">Add and edit student marks — changes reflect on student dashboards</p>
      </motion.div>
      <div className="flex items-center gap-4">
        <Select value={selectedSubject} onValueChange={(v) => v && setSelectedSubject(v)}>
          <SelectTrigger className="w-64"><SelectValue placeholder="Select subject">{subjects.find(s => s.id === selectedSubject)?.name || "Select subject"}</SelectValue></SelectTrigger>
          <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>)}</SelectContent>
        </Select>
        <Button onClick={handleSaveAll} disabled={saving || !selectedSubject}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save All
        </Button>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="pt-6">
            {students.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No students found.</p>
            ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>Student</TableHead><TableHead>Roll No</TableHead>
                <TableHead className="text-center">Internal (50)</TableHead>
                <TableHead className="text-center">External (100)</TableHead>
                <TableHead className="text-center">Total (150)</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs bg-primary/10 text-primary">{s.avatar}</AvatarFallback></Avatar><span className="font-medium">{s.name}</span></div></TableCell>
                    <TableCell className="text-muted-foreground">{s.rollNumber}</TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={50} className="w-20 mx-auto text-center"
                        value={rows[s.id]?.internal ?? 0}
                        onChange={(e) => updateRow(s.id, "internal", Math.min(50, Math.max(0, Number(e.target.value))))} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" min={0} max={100} className="w-20 mx-auto text-center"
                        value={rows[s.id]?.external ?? 0}
                        onChange={(e) => updateRow(s.id, "external", Math.min(100, Math.max(0, Number(e.target.value))))} />
                    </TableCell>
                    <TableCell className="text-center font-semibold">{getTotal(s.id)}</TableCell>
                  </TableRow>
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
