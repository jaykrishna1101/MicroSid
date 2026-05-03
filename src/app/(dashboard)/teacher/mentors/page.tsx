"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight, CheckCircle2, XCircle, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMentorPairings, updateMentorPairingStatus, suggestMentorPairings } from "@/services/api";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";
import { toast } from "sonner";
import type { MentorPairing } from "@/types";

const statusColors: Record<string, string> = {
  suggested: "bg-yellow-500/10 text-yellow-600",
  active: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-blue-500/10 text-blue-600",
  rejected: "bg-red-500/10 text-red-600",
};

export default function TeacherMentors() {
  const [pairings, setPairings] = useState<MentorPairing[]>([]);
  const [tab, setTab] = useState("all");
  const [generating, setGenerating] = useState(false);

  const loadPairings = () => { getMentorPairings().then(setPairings).catch(() => {}); };
  useEffect(() => { loadPairings(); }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateMentorPairingStatus(id, "active");
      setPairings(p => p.map(m => m.id === id ? { ...m, status: "active" } : m));
      toast.success("Pairing approved! Both students have been notified.");
    } catch (e: any) { toast.error(e.message || "Failed to approve"); }
  };

  const handleReject = async (id: string) => {
    try {
      await updateMentorPairingStatus(id, "rejected");
      setPairings(p => p.map(m => m.id === id ? { ...m, status: "rejected" } : m));
      toast.info("Pairing rejected. Both students have been notified.");
    } catch (e: any) { toast.error(e.message || "Failed to reject"); }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const count = await suggestMentorPairings();
      if (count > 0) {
        toast.success(`Generated ${count} new mentor pairing suggestions!`);
        loadPairings();
      } else {
        toast.info("No new pairings to suggest (all eligible pairs already exist or not enough students).");
      }
    } catch (e: any) { toast.error(e.message || "Failed to generate"); }
    finally { setGenerating(false); }
  };

  const filtered = tab === "all" ? pairings : pairings.filter(p => p.status === tab);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mentor Pairings</h1>
          <p className="text-muted-foreground mt-1">Manage and approve peer mentor assignments</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
          Generate Suggestions
        </Button>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">All ({pairings.length})</TabsTrigger>
          <TabsTrigger value="suggested">Pending ({pairings.filter(p => p.status === "suggested").length})</TabsTrigger>
          <TabsTrigger value="active">Active ({pairings.filter(p => p.status === "active").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({pairings.filter(p => p.status === "rejected").length})</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="mt-4">
          {filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No mentor pairings in this category.</p>
          ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((mp) => (
              <StaggerItem key={mp.id}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <Avatar className="h-12 w-12 mx-auto"><AvatarFallback className="bg-emerald-500/20 text-emerald-600 font-semibold">{mp.mentorAvatar}</AvatarFallback></Avatar>
                        <p className="text-sm font-medium mt-1">{mp.mentorName}</p>
                        <p className="text-xs text-muted-foreground">CGPA: {mp.mentorCgpa}</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="text-center">
                        <Avatar className="h-12 w-12 mx-auto"><AvatarFallback className="bg-orange-500/20 text-orange-600 font-semibold">{mp.menteeAvatar}</AvatarFallback></Avatar>
                        <p className="text-sm font-medium mt-1">{mp.menteeName}</p>
                        <p className="text-xs text-muted-foreground">CGPA: {mp.menteeCgpa}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {mp.subject && <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Subject</span><Badge variant="secondary">{mp.subject}</Badge></div>}
                      <Badge className={cn("w-full justify-center", statusColors[mp.status] || "")} variant="outline">{mp.status.charAt(0).toUpperCase() + mp.status.slice(1)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{mp.reason}</p>
                    {mp.status === "suggested" && (
                      <div className="flex gap-2"><Button size="sm" className="flex-1" onClick={() => handleApprove(mp.id)}><CheckCircle2 className="h-3 w-3 mr-1" /> Approve</Button><Button variant="outline" size="sm" className="flex-1" onClick={() => handleReject(mp.id)}><XCircle className="h-3 w-3 mr-1" /> Reject</Button></div>
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
