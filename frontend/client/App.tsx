import "./global.css";

import { Suspense } from "react";
import { useAppInit } from "@/lib/hooks/useAppInit";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Layout from "@/components/layout/Layout";
import ProtectedRoute, {
  LoadingRoute,
} from "@/components/guards/ProtectedRoute";
import { APP_ROUTES } from "@/lib/constants";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminLogin from "./pages/auth/AdminLogin";

// Public Pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TrackComplaint from "./pages/TrackComplaint";
import Announcements from "./pages/Announcements";
import CreateComplaint from "./pages/CreateComplaint";
import Profile from "./pages/Profile";
import ComplaintHistory from "./pages/ComplaintHistory";
import Rules from "./pages/Rules";
import Leaderboards from "./pages/Leaderboards";
import PointsHistory from "./pages/PointsHistory";
import Withdrawal from "./pages/Withdrawal";
import WithdrawPoints from "./pages/WithdrawPoints";
import WithdrawalHistory from "./pages/WithdrawalHistory";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminRules from "./pages/admin/AdminRules";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminConfig from "./pages/admin/AdminConfig";
import NotFound from "./pages/NotFound";
import { User } from "lucide-react";

// Placeholder components for routes to be implemented later
const PlaceholderPage = ({ title }: { title: string }) => (
  <Layout>
    <div className="container max-w-4xl mx-auto p-6">
      <div className="text-center py-20">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <p className="text-muted-foreground mb-6">
          This page is under construction. Check back soon!
        </p>
        <div className="h-32 w-32 mx-auto bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-4xl font-bold">🚧</span>
        </div>
      </div>
    </div>
  </Layout>
);

const queryClient = new QueryClient();

function AppContent() {
  useAppInit();

  return (
    <Suspense fallback={<LoadingRoute />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path={APP_ROUTES.HOME}
          element={
            <Layout>
              <CreateComplaint />
            </Layout>
          }
        />
        <Route
          path={APP_ROUTES.LOGIN}
          element={
            <ProtectedRoute requireAuth={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.REGISTER}
          element={
            <ProtectedRoute requireAuth={false}>
              <Register />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_LOGIN}
          element={
            <ProtectedRoute requireAuth={false}>
              <AdminLogin />
            </ProtectedRoute>
          }
        />
        <Route path={APP_ROUTES.TRACK_COMPLAINT} element={<TrackComplaint />} />
        <Route path={APP_ROUTES.ANNOUNCEMENTS} element={<Announcements />} />
        <Route path={APP_ROUTES.RULES} element={<Rules />} />

        {/* Protected User Routes */}
        <Route
          path={APP_ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.CREATE_COMPLAINT}
          element={
            <Layout>
              <CreateComplaint />
            </Layout>
          }
        />
        <Route
          path={APP_ROUTES.COMPLAINT_HISTORY}
          element={
            <ProtectedRoute>
              <ComplaintHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.POINTS_HISTORY}
          element={
            <ProtectedRoute>
              <PointsHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.WITHDRAWAL}
          element={
            <ProtectedRoute>
              <Withdrawal />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.WITHDRAW_POINTS}
          element={
            <ProtectedRoute>
              <WithdrawPoints />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.WITHDRAWAL_HISTORY}
          element={
            <ProtectedRoute>
              <WithdrawalHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.LEADERBOARDS}
          element={
            <ProtectedRoute>
              <Leaderboards />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path={APP_ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_COMPLAINTS}
          element={
            <ProtectedRoute
              requireAdmin={true}
              permissions={["viewComplaints"]}
            >
              <AdminComplaints />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_ANNOUNCEMENTS}
          element={
            <ProtectedRoute
              requireAdmin={true}
              permissions={["manageAnnouncements"]}
            >
              <AdminAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_RULES}
          element={
            <ProtectedRoute requireAdmin={true} permissions={["manageRules"]}>
              <AdminRules />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_WITHDRAWALS}
          element={
            <ProtectedRoute
              requireAdmin={true}
              permissions={["viewWithdrawals"]}
            >
              <AdminWithdrawals />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_ROLES}
          element={
            <ProtectedRoute requireAdmin={true} permissions={["manageRoles"]}>
              <AdminRoles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true} permissions={["manageUsers"]}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute
              requireAdmin={true}
              permissions={["manageNotifications"]}
            >
              <AdminNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute requireAdmin={true} permissions={["viewReports"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_HISTORY}
          element={
            <ProtectedRoute requireAdmin={true} permissions={["viewHistory"]}>
              <AdminHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_CONFIG}
          element={
            <ProtectedRoute requireAdmin={true} permissions={["updateConfig"]}>
              <AdminConfig />
            </ProtectedRoute>
          }
        />
        <Route
          path={APP_ROUTES.ADMIN_ANALYTICS}
          element={
            <ProtectedRoute requireAdmin={true} permissions={["viewAnalytics"]}>
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
