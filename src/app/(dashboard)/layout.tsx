"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/shared/PageTransition";
import { useSidebarStore, useNotificationStore } from "@/store";
import { getNotifications } from "@/services/api";
import { cn } from "@/lib/utils";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebarStore();
  const { setNotifications } = useNotificationStore();

  useEffect(() => {
    getNotifications().then(setNotifications);
  }, [setNotifications]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        "flex flex-col transition-all duration-300",
        isCollapsed ? "md:ml-[72px]" : "md:ml-[260px]"
      )}>
        <Navbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
