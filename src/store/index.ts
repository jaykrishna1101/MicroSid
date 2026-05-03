import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginCredentials, SignupData, Notification, Role } from "@/types";
import { loginUser, signupUser } from "@/services/api";

// ─── Auth Store ─────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (creds: LoginCredentials) => Promise<Role>;
  signup: (data: SignupData) => Promise<Role>;
  logout: () => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (creds) => {
        set({ isLoading: true });
        try {
          const user = await loginUser(creds);
          set({ user, isAuthenticated: true, isLoading: false });
          return user.role;
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.message || "Login failed");
        }
      },
      signup: async (data) => {
        set({ isLoading: true });
        try {
          const user = await signupUser(data);
          set({ user, isAuthenticated: true, isLoading: false });
          return user.role;
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.message || "Signup failed");
        }
      },
      logout: () => {
        import("@/lib/supabase").then(({ createClient }) => {
          createClient().auth.signOut();
        });
        set({ user: null, isAuthenticated: false });
      },
      clearAuth: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set({ user, isAuthenticated: true }),
    }),
    {
      name: "eduverse-auth-v2",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


// ─── Theme Store ────────────────────────────────────────
interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (t: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "eduverse-theme" }
  )
);

// ─── Sidebar Store ──────────────────────────────────────
interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setOpen: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isOpen: false,
  isCollapsed: false,
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  setCollapsed: (isCollapsed) => set({ isCollapsed }),
}));

// ─── Notification Store ─────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  setNotifications: (n: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  setNotifications: (notifications) => set({ notifications, unreadCount: notifications.filter(n => !n.isRead).length }),
  markRead: (id) => set((s) => {
    const updated = s.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length };
  }),
  markAllRead: () => set((s) => ({
    notifications: s.notifications.map(n => ({ ...n, isRead: true })),
    unreadCount: 0,
  })),
}));
