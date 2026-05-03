"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Calculator } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMarks, getSubjects, getCurrentStudent } from "@/services/api";
import { cn } from "@/lib/utils";
import type { Mark, Subject } from "@/types";

const gradeColors: Record<string, string> = {
  "O": "text-emerald-500", "A+": "text-emerald-500", "A": "text-blue-500",
  "B+": "text-indigo-500", "B": "text-yellow-500", "C": "text-orange-500",
  "D": "text-red-500", "F": "text-red-600",
};

export default function StudentMarks() {
  const [studentMarks, setStudentMarks] = useState<Mark[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [showCalc, setShowCalc] = useState(false);
  const [calcSubjects, setCalcSubjects] = useState<{ id: string; name: string; credits: number; gradePoint: number }[]>([]);

  useEffect(() => {
    getCurrentStudent().then(s => {
      getMarks(s.id).then(setStudentMarks);
    }).catch(() => {});
    getSubjects().then(subs => {
      setAllSubjects(subs);
      setCalcSubjects(subs.map(s => ({ id: s.id, name: s.name, credits: s.credits, gradePoint: 0 })));
    }).catch(() => {});
  }, []);

  const totalCredits = studentMarks.reduce((sum, m) => sum + m.credits, 0);
  const weightedSum = studentMarks.reduce((sum, m) => sum + m.credits * m.gradePoint, 0);
  const sgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : "0.00";

  const calcSgpa = () => {
    const tc = calcSubjects.reduce((s, c) => s + c.credits, 0);
    const ws = calcSubjects.reduce((s, c) => s + c.credits * c.gradePoint, 0);
    return tc > 0 ? (ws / tc).toFixed(2) : "0.00";
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Marks & Grades</h1>
        <p className="text-muted-foreground mt-1">View your academic performance</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Current SGPA</p>
            <p className="text-4xl font-bold mt-1">{sgpa}</p>
          </CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Total Credits</p>
            <p className="text-4xl font-bold mt-1">{totalCredits}</p>
          </CardContent></Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-sm text-muted-foreground">Subjects</p>
            <p className="text-4xl font-bold mt-1">{studentMarks.length}</p>
          </CardContent></Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Award className="h-5 w-5" /> Semester Marks</CardTitle></CardHeader>
          <CardContent>
            {studentMarks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No marks recorded yet.</p>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead><TableHead>Code</TableHead>
                  <TableHead className="text-center">Credits</TableHead><TableHead className="text-center">Internal</TableHead>
                  <TableHead className="text-center">External</TableHead><TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Grade</TableHead><TableHead className="text-center">GP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentMarks.map((m, i) => (
                  <motion.tr key={m.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }} className="border-b border-border">
                    <TableCell className="font-medium">{m.subjectName}</TableCell>
                    <TableCell className="text-muted-foreground">{m.subjectCode}</TableCell>
                    <TableCell className="text-center">{m.credits}</TableCell>
                    <TableCell className="text-center">{m.internalMarks}/50</TableCell>
                    <TableCell className="text-center">{m.externalMarks}/100</TableCell>
                    <TableCell className="text-center font-semibold">{m.totalMarks}/{m.maxMarks}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className={cn("font-semibold", gradeColors[m.grade])}>{m.grade}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">{m.gradePoint}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Calculator className="h-5 w-5" /> CGPA/SGPA Calculator</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowCalc(!showCalc)}>{showCalc ? "Hide" : "Show"} Calculator</Button>
            </div>
          </CardHeader>
          {showCalc && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {calcSubjects.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Credits: {s.credits}</p>
                    </div>
                    <Input type="number" min="0" max="10" className="w-16 text-center" placeholder="GP" value={s.gradePoint || ""}
                      onChange={(e) => { const updated = [...calcSubjects]; updated[i].gradePoint = Number(e.target.value); setCalcSubjects(updated); }} />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                <span className="font-semibold">Calculated SGPA:</span>
                <span className="text-2xl font-bold text-primary">{calcSgpa()}</span>
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
