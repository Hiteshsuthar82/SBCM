import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { APP_ROUTES } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Home,
  MessageSquare,
  Megaphone,
  Trophy,
  User,
  Search,
  Wallet,
} from "lucide-react";

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  requireAuth?: boolean;
}

const userNavItems: NavItem[] = [
  {
    title: "Home",
    icon: Home,
    href: APP_ROUTES.HOME,
  },
  {
    title: "Track",
    icon: Search,
    href: APP_ROUTES.TRACK_COMPLAINT,
  },
  {
    title: "Complaint",
    icon: MessageSquare,
    href: APP_ROUTES.CREATE_COMPLAINT,
  },
  {
    title: "Withdraw",
    icon: Wallet,
    href: APP_ROUTES.WITHDRAWAL,
    requireAuth: true,
  },
  {
    title: "Profile",
    icon: User,
    href: APP_ROUTES.PROFILE,
    requireAuth: true,
  },
];

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  // Don't show bottom nav for admin users or on admin pages
  if (isAdmin || location.pathname.startsWith("/admin")) {
    return null;
  }

  // Don't show on desktop
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {userNavItems.map((item) => {
          // Skip auth-required items if not authenticated
          if (item.requireAuth && !isAuthenticated) {
            return null;
          }

          const isActive = location.pathname === item.href;

          return (
            <Link
              key={item.title}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                "min-w-[60px] h-14",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
