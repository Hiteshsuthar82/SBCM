import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth";
import { authService } from "../services/auth";
import { toast } from "@/hooks/use-toast";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const {
    user,
    admin,
    token,
    isAuthenticated,
    isAdmin,
    setUser,
    setAdmin,
    setToken,
    logout,
  } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (token && !user && !admin) {
        try {
          const response = await authService.verifyToken();
          if (response.user) {
            setUser(response.user);
          } else if (response.admin) {
            setAdmin(response.admin);
          }
        } catch (error) {
          // In demo mode, silently handle token verification failures
          console.log("Token verification failed (demo mode):", error);
          // Don't logout immediately - let user continue with the app
          // logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token, user, admin, setUser, setAdmin, logout]);

  const login = async (mobile: string, otp: string, sessionId: string) => {
    try {
      const response = await authService.login({ mobile, otp, sessionId });
      setToken(response.token);
      if (response.user) {
        setUser(response.user);
      }
      toast({
        title: "Login Successful",
        description: "Welcome to SBCMS!",
      });
      return response;
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await authService.adminLogin({ email, password });
      setToken(response.token);
      if (response.admin) {
        setAdmin(response.admin);
      }
      toast({
        title: "Admin Login Successful",
        description: "Welcome to SBCMS Admin Panel!",
      });
      return response;
    } catch (error: any) {
      toast({
        title: "Admin Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (name: string, mobile: string) => {
    try {
      const response = await authService.register({ name, mobile });
      toast({
        title: "Registration Successful",
        description: "OTP sent to your mobile number",
      });
      return response;
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

  return {
    user,
    admin,
    token,
    isAuthenticated,
    isAdmin,
    loading,
    login,
    adminLogin,
    register,
    logout: handleLogout,
  };
}
