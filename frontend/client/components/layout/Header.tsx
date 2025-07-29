import {
  Moon,
  Sun,
  Menu,
  Bell,
  LogOut,
  User,
  Languages,
  Wallet,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAppStore } from "@/lib/stores/app";
import { LANGUAGE_NAMES, APP_ROUTES } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface HeaderProps {
  showSidebarToggle?: boolean;
}

export default function Header({ showSidebarToggle = false }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user, admin, isAuthenticated, logout } = useAuth();
  const { language, setLanguage, toggleSidebar } = useAppStore();
  const navigate = useNavigate();

  const currentUser = user || admin;

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    // Trigger Google Translate API here
    // This would be implemented with the Google Translate API
  };

  const handleProfileClick = () => {
    if (admin) {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {showSidebarToggle && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                Surat BRTS
              </h1>
              <p className="text-xs text-muted-foreground">
                Complaint Management
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications (for authenticated users) */}
          {isAuthenticated && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs"
              >
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {/* User Menu */}
          {isAuthenticated && currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={currentUser.photo || ""}
                      alt={currentUser.name}
                    />
                    <AvatarFallback>
                      {currentUser.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-2 hidden lg:block text-left">
                    <p className="text-sm font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {admin ? admin.role : user?.points + " points"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {user && (
                  <>
                    <DropdownMenuItem
                      onClick={() => navigate(APP_ROUTES.WITHDRAWAL)}
                    >
                      <Wallet className="mr-2 h-4 w-4" />
                      Withdraw Points
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate(APP_ROUTES.POINTS_HISTORY)}
                    >
                      <History className="mr-2 h-4 w-4" />
                      Points History
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate("/login")}>
                Login
              </Button>
              <Button onClick={() => navigate("/register")}>Register</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
