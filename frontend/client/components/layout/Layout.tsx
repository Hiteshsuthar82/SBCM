import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/lib/stores/app";
import Header from "./Header";
import Sidebar from "./Sidebar";
import UserSidebar from "./UserSidebar";
import BottomNav from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

export default function Layout({ children, className }: LayoutProps) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { sidebarOpen } = useAppStore();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const showAdminSidebar = isAdmin && isAdminRoute;
  const showUserSidebar = !isAdmin || !isAdminRoute; // Show user sidebar for non-admin or non-admin routes
  const showBottomNav = !isAdmin && !isAdminRoute;

  return (
    <div className="min-h-screen bg-background">
      <Header showSidebarToggle={showAdminSidebar || showUserSidebar} />

      <div className="flex">
        {showAdminSidebar && <Sidebar />}
        {showUserSidebar && !showAdminSidebar && <UserSidebar />}

        <main
          className={cn(
            "flex-1 transition-all duration-200 ease-in-out",
            (showAdminSidebar || showUserSidebar) && "lg:ml-64",
            showBottomNav && "pb-20 lg:pb-0",
            className,
          )}
        >
          {children}
        </main>
      </div>

      {showBottomNav && <BottomNav />}
    </div>
  );
}

// Layout wrapper for admin pages
export function AdminLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

// Layout wrapper for user pages
export function UserLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}
