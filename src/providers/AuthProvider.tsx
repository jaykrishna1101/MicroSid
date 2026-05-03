"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store";
import { createClient } from "@/lib/supabase";

const publicPaths = ["/login", "/signup", "/"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, setUser, clearAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const initialized = useRef(false);

  // On first mount only: check if there's already an active session
  // (handles page refresh with a valid Supabase session in cookies)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Session already exists — restore profile into store
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profile) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: profile.name,
            role: profile.role,
            avatar: profile.avatar,
            createdAt: session.user.created_at,
          });
        }
      }
    }).catch(() => {});

    // Listen only for SIGNED_OUT to clear local state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "SIGNED_OUT") {
          clearAuth();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, clearAuth]);

  // Route protection — only fires when auth state is settled
  useEffect(() => {
    if (isLoading) return;
    const isPublic = publicPaths.includes(pathname);
    if (!isAuthenticated && !isPublic) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  return <>{children}</>;
}
