import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/stores/auth";
import { APP_ROUTES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  permissions?: string[];
  fallbackPath?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  permissions = [],
  fallbackPath,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isAdmin, admin, user, token } = useAuthStore();

  // If no auth required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // Check if user is authenticated
  if (!isAuthenticated || !token) {
    const redirectPath = requireAdmin
      ? APP_ROUTES.ADMIN_LOGIN
      : APP_ROUTES.LOGIN;
    return (
      <Navigate
        to={fallbackPath || redirectPath}
        state={{ from: location }}
        replace
      />
    );
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin) {
    return <Navigate to={APP_ROUTES.LOGIN} replace />;
  }

  // Check permissions for admin users
  if (permissions.length > 0 && admin) {
    const hasPermission = permissions.some((permission) =>
      admin.permissions?.includes(permission),
    );
    if (!hasPermission) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">
              Access Denied
            </h1>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}

export function LoadingRoute() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
