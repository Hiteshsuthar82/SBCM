import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/app";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  MessageSquare,
  Megaphone,
  BookOpen,
  CreditCard,
  Users,
  History,
  Settings,
  BarChart3,
  X,
  ChevronDown,
  ChevronRight,
  Bell,
  UserCog,
  FileText,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavItem[];
  permission?: string;
}

const adminNavItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Complaints",
    icon: MessageSquare,
    href: "/admin/complaints",
    permission: "viewComplaints",
  },
  {
    title: "Announcements",
    icon: Megaphone,
    href: "/admin/announcements",
    permission: "manageAnnouncements",
  },
  {
    title: "Rules",
    icon: BookOpen,
    href: "/admin/rules",
    permission: "manageRules",
  },
  {
    title: "Withdrawals",
    icon: CreditCard,
    href: "/admin/withdrawals",
    permission: "viewWithdrawals",
  },
  {
    title: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
    permission: "manageNotifications",
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      {
        title: "Users",
        icon: UserCog,
        href: "/admin/users",
        permission: "manageUsers",
      },
      {
        title: "Roles",
        icon: Users,
        href: "/admin/roles",
        permission: "manageRoles",
      },
    ],
  },
  {
    title: "System",
    icon: Settings,
    children: [
      {
        title: "Reports",
        icon: FileText,
        href: "/admin/reports",
        permission: "viewReports",
      },
      {
        title: "Action History",
        icon: History,
        href: "/admin/history",
        permission: "viewHistory",
      },
      {
        title: "Configuration",
        icon: Settings,
        href: "/admin/config",
        permission: "updateConfig",
      },
      {
        title: "Analytics",
        icon: BarChart3,
        href: "/admin/analytics",
        permission: "viewAnalytics",
      },
    ],
  },
];

export default function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const { admin } = useAuth();
  const [openSections, setOpenSections] = useState<string[]>([]);

  const hasPermission = (permission?: string) => {
    if (!permission || !admin) return true;
    return admin.permissions?.includes(permission) || false;
  };

  const toggleSection = (title: string) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((section) => section !== title)
        : [...prev, title],
    );
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    if (!hasPermission(item.permission)) return null;

    const isActive = item.href === location.pathname;
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openSections.includes(item.title);

    if (hasChildren) {
      return (
        <Collapsible
          key={item.title}
          open={isOpen}
          onOpenChange={() => toggleSection(item.title)}
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start h-10 px-4",
                level > 0 && "pl-8",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children?.map((child) => renderNavItem(child, level + 1))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Button
        key={item.title}
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start h-10 px-4",
          level > 0 && "pl-8",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
        asChild
      >
        <Link to={item.href!}>
          <item.icon className="mr-3 h-4 w-4" />
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
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">
                SBCMS Admin
              </h2>
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
          <nav className="space-y-1">
            {adminNavItems.map((item) => renderNavItem(item))}
          </nav>
        </ScrollArea>
      </div>
    </>
  );
}
