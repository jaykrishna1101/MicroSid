"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getMentorPairings } from "@/services/api";
import { cn } from "@/lib/utils";
import { StaggerContainer, StaggerItem } from "@/components/shared/AnimatedCard";
import type { MentorPairing } from "@/types";

const statusColors: Record<string, string> = {
  suggested: "bg-yellow-500/10 text-yellow-600",
  active: "bg-emerald-500/10 text-emerald-600",
  completed: "bg-blue-500/10 text-blue-600",
  rejected: "bg-red-500/10 text-red-600",
};

export default function StudentMentors() {
  const [pairings, setPairings] = useState<MentorPairing[]>([]);
  useEffect(() => { getMentorPairings().then(setPairings).catch(() => {}); }, []);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold tracking-tight">Peer Mentors</h1>
        <p className="text-muted-foreground mt-1">Connect with mentors who can help you excel</p>
      </motion.div>
      {pairings.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">No mentor pairings yet.</p>
      ) : (
      <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pairings.map((mp) => (
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
                  <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Subject</span><Badge variant="secondary">{mp.subject}</Badge></div>
                  <Badge className={cn("w-full justify-center", statusColors[mp.status])} variant="outline">{mp.status.charAt(0).toUpperCase() + mp.status.slice(1)}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{mp.reason}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>
      )}
    </div>
  );
}
