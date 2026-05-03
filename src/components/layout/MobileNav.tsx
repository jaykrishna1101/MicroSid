"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store";
import { NAV_STUDENT, NAV_TEACHER, APP_NAME } from "@/lib/constants";
import { GraduationCap, LogOut, LayoutDashboard, ClipboardList, Award, BarChart3, Calendar, Bell, Users, FileCheck, Megaphone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetClose } from "@/components/ui/sheet";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, ClipboardList, Award, BarChart3, Calendar, Bell, Users, FileCheck, Megaphone,
};

export function MobileNav() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const navItems = user?.role === "teacher" ? NAV_TEACHER : NAV_STUDENT;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-16 items-center gap-3 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-primary to-chart-4 bg-clip-text text-transparent">
          {APP_NAME}
        </span>
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href;
          return (
            <SheetClose
              key={item.href}
              render={
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent"
                  )}
                />
              }
            >
                <Icon className="h-5 w-5" />
                {item.label}
            </SheetClose>
          );
        })}
      </nav>
      <Separator />
      <div className="p-3">
        <div className="flex items-center gap-3 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
              {user?.avatar || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-destructive mt-1" onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </div>
  );
}
