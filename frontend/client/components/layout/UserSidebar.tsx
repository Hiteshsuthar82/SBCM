import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/app";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfig } from "@/lib/services/config";
import {
  MessageSquare,
  Search,
  History,
  Megaphone,
  BookOpen,
  Trophy,
  Wallet,
  Award,
  User,
  X,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  requireAuth?: boolean;
  requireFeature?: string;
}

const userNavItems: NavItem[] = [
  {
    title: "Create Complaint",
    icon: MessageSquare,
    href: "/complaint/create",
  },
  {
    title: "Track Complaint",
    icon: Search,
    href: "/track",
  },
  {
    title: "Complaint History",
    icon: History,
    href: "/complaint/history",
    requireAuth: true,
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/announcements",
  },
  {
    title: "Rules",
    icon: BookOpen,
    href: "/rules",
  },
  {
    title: "Withdraw Points",
    icon: Wallet,
    href: "/withdrawal",
    requireAuth: true,
    requireFeature: "enableRewards",
  },
  {
    title: "Points History",
    icon: Award,
    href: "/points-history",
    requireAuth: true,
    requireFeature: "enableRewards",
  },
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboards",
    requireFeature: "enableLeaderboards",
  },
  {
    title: "Profile",
    icon: User,
    href: "/profile",
    requireAuth: true,
  },
];

export default function UserSidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { isAuthenticated } = useAuth();
  const { isFeatureEnabled } = useConfig();

  const shouldShowNavItem = (item: NavItem) => {
    // Check authentication requirement
    if (item.requireAuth && !isAuthenticated) {
      return false;
    }

    // Check feature requirement
    if (item.requireFeature && !isFeatureEnabled(item.requireFeature as any)) {
      return false;
    }

    return true;
  };

  const renderNavItem = (item: NavItem) => {
    if (!shouldShowNavItem(item)) return null;

    const isActive = item.href === location.pathname;

    return (
      <Button
        key={item.title}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-12 px-4",
          isActive
            ? "bg-primary/10 text-primary border-r-2 border-primary"
            : "hover:bg-accent hover:text-accent-foreground",
        )}
        asChild
      >
        <Link to={item.href} onClick={() => setSidebarOpen(false)}>
          <item.icon className="mr-3 h-5 w-5" />
          {item.title}
        </Link>
      </Button>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-background border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold">Surat BRTS</h2>
              <p className="text-xs text-muted-foreground">Complaint System</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] px-2 py-4">
          <nav className="space-y-2">
            {userNavItems.map((item) => renderNavItem(item))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
