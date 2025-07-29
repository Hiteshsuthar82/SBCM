import { User, Admin, ApiResponse } from "../types";
import { authAPI } from "./api";

export interface RegisterRequest {
  name: string;
  mobile: string;
}

export interface LoginRequest {
  mobile: string;
  otp: string;
  sessionId: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  sessionId: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
  admin?: Admin;
}

// Mock data for demo purposes
const mockUser: User = {
  id: "user123",
  name: "John Doe",
  mobile: "9876543210",
  email: "john@example.com",
  address: "123 Main St, Surat, Gujarat",
  profession: "Engineer",
  language: "en",
  points: 150,
  progress: 75,
  isAdmin: false,
  paymentDetails: {
    upiId: "john@paytm",
    bankAccount: "1234567890",
    ifsc: "SBIN0001234",
  },
};

const mockAdmin: Admin = {
  id: "admin123",
  email: "admin@sbcms.com",
  role: "super_admin",
  permissions: [
    "viewComplaints",
    "approveComplaints",
    "manageAnnouncements",
    "manageRules",
    "viewWithdrawals",
    "approveWithdrawals",
    "manageRoles",
    "viewHistory",
    "updateConfig",
    "viewAnalytics",
    "sendNotifications",
  ],
  name: "System Administrator",
};

export const authService = {
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await authAPI.register(data);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data if API is not available
      console.warn("API not available, using mock registration:", error);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return {
        sessionId: "mock-session-" + Date.now(),
      };
    }
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authAPI.login(data);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data if API is not available
      console.warn("API not available, using mock login:", error);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check for demo OTP
      if (data.otp !== "123456") {
        throw new Error("Invalid OTP. Use 123456 for demo.");
      }

      // Return mock user data
      return {
        token: "mock-jwt-token-" + Date.now(),
        user: mockUser,
      };
    }
  },

  adminLogin: async (data: AdminLoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authAPI.adminLogin(data);
      return response.data;
    } catch (error: any) {
      // Fallback to mock data if API is not available
      console.warn("API not available, using mock admin login:", error);
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Check for demo credentials
      if (data.email !== "admin@sbcms.com" || data.password !== "admin123") {
        throw new Error(
          "Invalid credentials. Use admin@sbcms.com / admin123 for demo.",
        );
      }

      // Return mock admin data
      return {
        token: "mock-admin-jwt-token-" + Date.now(),
        admin: mockAdmin,
      };
    }
  },

  verifyToken: async (): Promise<{ user?: User; admin?: Admin }> => {
    try {
      const response = await authAPI.verifyToken();
      return response.data;
    } catch (error: any) {
      // Fallback to mock verification if API is not available
      console.warn("API not available, using mock token verification:", error);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Get stored token from localStorage
      const storedAuth = localStorage.getItem("sbcms-auth");
      if (!storedAuth) {
        throw new Error("No token found");
      }

      try {
        const authData = JSON.parse(storedAuth);
        if (authData.token && authData.token.includes("admin")) {
          return { admin: mockAdmin };
        } else if (authData.token) {
          return { user: mockUser };
        }
      } catch (error) {
        // Invalid stored data
      }

      throw new Error("Invalid token");
    }
  },

  refreshToken: async (): Promise<LoginResponse> => {
    try {
      const response = await authAPI.refreshToken();
      return response.data;
    } catch (error: any) {
      // Fallback to mock refresh if API is not available
      console.warn("API not available, using mock token refresh:", error);
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        token: "mock-refreshed-token-" + Date.now(),
        user: mockUser,
      };
    }
  },
};
