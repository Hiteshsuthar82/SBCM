// API service functions for SBCMS backend integration
import { apiRequest, uploadFile } from "../../api";

// Auth API
export const authAPI = {
  register: (data: { name: string; mobile: string }) =>
    apiRequest("POST", "/auth/register", data),

  sendLoginOtp: (data: { mobile: string }) =>
    apiRequest("POST", "/auth/send-otp", data),

  login: (data: { mobile: string; otp: string; sessionId: string }) =>
    apiRequest("POST", "/auth/login", data),

  adminLogin: (data: { email: string; password: string }) =>
    apiRequest("POST", "/auth/admin/login", data),

  verifyToken: () => apiRequest("GET", "/auth/verify"),

  refreshToken: () => apiRequest("POST", "/auth/refresh"),
};

// Complaints API
export const complaintsAPI = {
  create: (formData: FormData) => uploadFile("/complaints", formData),

  track: (token: string) => apiRequest("GET", `/complaints/track/${token}`),

  getHistory: () => apiRequest("GET", "/complaints/history"),

  getAll: () => apiRequest("GET", "/complaints"),

  approve: (
    id: string,
    data: { status: string; reason?: string; description?: string },
  ) => apiRequest("PUT", `/complaints/${id}/approve`, data),

  getUserComplaints: (params?: { limit?: number }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiRequest("GET", `/complaints/user${query}`);
  },
  
  getByToken: (token: string) => apiRequest("GET", `/complaints/track/${token}`),
};

// Announcements API
export const announcementsAPI = {
  create: (formData: FormData) => uploadFile("/announcements", formData),

  getAll: () => apiRequest("GET", "/announcements"),

  like: (id: string) => apiRequest("POST", `/announcements/${id}/like`),

  dislike: (id: string) => apiRequest("POST", `/announcements/${id}/dislike`),
};

// Rules API
export const rulesAPI = {
  create: (data: { category: string; description: string }) =>
    apiRequest("POST", "/rules", data),

  getAll: () => apiRequest("GET", "/rules"),

  update: (id: string, data: { category: string; description: string }) =>
    apiRequest("PUT", `/rules/${id}`, data),

  delete: (id: string) => apiRequest("DELETE", `/rules/${id}`),
};

// Withdrawals API
export const withdrawalsAPI = {
  create: (data: { points: number; method: string; paymentDetails?: any }) =>
    apiRequest("POST", "/withdrawals", data),

  getAll: () => apiRequest("GET", "/withdrawals"),

  approve: (
    id: string,
    data: {
      status: string;
      reason?: string;
      description?: string;
      paymentDetails?: any;
    },
  ) => apiRequest("PUT", `/withdrawals/${id}/approve`, data),

  getUserWithdrawals: () => apiRequest("GET", "/withdrawals/user"),
};

// Profile API
export const profileAPI = {
  update: (formData: FormData) => uploadFile("/profiles", formData),

  get: () => apiRequest("GET", "/profiles"),
};

// Leaderboards API
export const leaderboardsAPI = {
  get: () => apiRequest("GET", "/leaderboards"),
};

// Notifications API
export const notificationsAPI = {
  send: (data: {
    title: string;
    message: string;
    audience: string;
    specificUsers?: string[];
    priority: string;
    actionUrl?: string;
    scheduleTime?: string;
  }) => apiRequest("POST", "/notifications/send", data),

  getHistory: () => apiRequest("GET", "/notifications/history"),
  
  getTemplates: () => apiRequest("GET", "/notifications/templates"),
};

// Config API
export const configAPI = {
  get: () => apiRequest("GET", "/config"),

  update: (data: { key: string; value: any }) =>
    apiRequest("PUT", "/config", data),
};

// Users API (for admin management)
export const usersAPI = {
  getAll: () => apiRequest("GET", "/users"),

  get: (id: string) => apiRequest("GET", `/users/${id}`),

  update: (id: string, data: any) => apiRequest("PUT", `/users/${id}`, data),

  activate: (id: string) => apiRequest("PUT", `/users/${id}/activate`),

  deactivate: (id: string) => apiRequest("PUT", `/users/${id}/deactivate`),

  delete: (id: string) => apiRequest("DELETE", `/users/${id}`),
};

// Admins API
export const adminsAPI = {
  getAll: () => apiRequest("GET", "/admins"),

  get: (id: string) => apiRequest("GET", `/admins/${id}`),

  create: (data: { email: string; password: string; role: string }) =>
    apiRequest("POST", "/admins", data),

  update: (id: string, data: any) => apiRequest("PUT", `/admins/${id}`, data),

  changeRole: (id: string, data: { role: string }) =>
    apiRequest("PUT", `/admins/${id}/role`, data),

  activate: (id: string) => apiRequest("PUT", `/admins/${id}/activate`),

  deactivate: (id: string) => apiRequest("PUT", `/admins/${id}/deactivate`),

  delete: (id: string) => apiRequest("DELETE", `/admins/${id}`),
};

// Roles API
export const rolesAPI = {
  getAll: () => apiRequest("GET", "/roles"),

  get: (id: string) => apiRequest("GET", `/roles/${id}`),

  create: (data: { name: string; permissions: any }) =>
    apiRequest("POST", "/roles", data),

  update: (id: string, data: { name: string; permissions: any }) =>
    apiRequest("PUT", `/roles/${id}`, data),

  delete: (id: string) => apiRequest("DELETE", `/roles/${id}`),
};

// Action History API
export const actionHistoryAPI = {
  getAll: () => apiRequest("GET", "/action-history"),

  get: (id: string) => apiRequest("GET", `/action-history/${id}`),
};

// Points History API
export const pointsHistoryAPI = {
  get: () => apiRequest("GET", "/points-history"),

  getByUser: (userId: string) =>
    apiRequest("GET", `/points-history/user/${userId}`),
};

// Bus Stops API (custom endpoints you'll need to add to backend)
export const busStopsAPI = {
  getAll: () => apiRequest("GET", "/bus-stops"),

  create: (data: { name: string; code: string; route: string }) =>
    apiRequest("POST", "/bus-stops", data),

  update: (id: string, data: { name: string; code: string; route: string }) =>
    apiRequest("PUT", `/bus-stops/${id}`, data),

  delete: (id: string) => apiRequest("DELETE", `/bus-stops/${id}`),

  activate: (id: string) => apiRequest("PUT", `/bus-stops/${id}/activate`),

  deactivate: (id: string) => apiRequest("PUT", `/bus-stops/${id}/deactivate`),
};

// Quick Tour API
export const quickTourAPI = {
  getAll: () => apiRequest("GET", "/quick-tours"),

  get: (id: string) => apiRequest("GET", `/quick-tours/${id}`),

  create: (data: any) => apiRequest("POST", "/quick-tours", data),

  update: (id: string, data: any) =>
    apiRequest("PUT", `/quick-tours/${id}`, data),

  delete: (id: string) => apiRequest("DELETE", `/quick-tours/${id}`),

  assign: (
    id: string,
    data: { roles: string[]; completed?: boolean; userId?: string },
  ) => apiRequest("PUT", `/quick-tours/${id}/assign`, data),

  markCompleted: (tourId: string, userId: string) =>
    apiRequest("POST", `/quick-tours/${tourId}/complete`, { userId }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => apiRequest("GET", "/analytics/dashboard"),

  getComplaints: (timeRange?: string) =>
    apiRequest(
      "GET",
      `/analytics/complaints${timeRange ? `?timeRange=${timeRange}` : ""}`,
    ),

  getUsers: (timeRange?: string) =>
    apiRequest(
      "GET",
      `/analytics/users${timeRange ? `?timeRange=${timeRange}` : ""}`,
    ),

  getSystem: () => apiRequest("GET", "/analytics/system"),

  getEngagement: () => apiRequest("GET", "/analytics/engagement"),

  exportReport: (type: string, timeRange?: string) =>
    apiRequest(
      "GET",
      `/analytics/export/${type}${timeRange ? `?timeRange=${timeRange}` : ""}`,
    ),
};

// Reports API
export const reportsAPI = {
  getAll: () => apiRequest("GET", "/reports"),

  generate: (data: { type: string; dateRange: any; filters?: any }) =>
    apiRequest("POST", "/reports/generate", data),

  download: (reportId: string) =>
    apiRequest("GET", `/reports/${reportId}/download`),

  schedule: (data: { type: string; frequency: string; recipients: string[] }) =>
    apiRequest("POST", "/reports/schedule", data),

  getHistory: () => apiRequest("GET", "/reports/history"),
};

// FCM Notifications API
export const fcmAPI = {
  sendToUser: (data: {
    userId: string;
    title: string;
    body: string;
    data?: any;
  }) => apiRequest("POST", "/fcm/send-to-user", data),

  sendToRole: (data: {
    role: string;
    title: string;
    body: string;
    data?: any;
  }) => apiRequest("POST", "/fcm/send-to-role", data),

  sendBroadcast: (data: { title: string; body: string; data?: any }) =>
    apiRequest("POST", "/fcm/broadcast", data),

  getTokens: () => apiRequest("GET", "/fcm/tokens"),

  updateToken: (data: { userId: string; token: string; platform: string }) =>
    apiRequest("POST", "/fcm/update-token", data),
};

// Dashboard API
export const dashboardAPI = {
  getUserStats: () => apiRequest("GET", "/dashboard/user-stats"),
  
  getAdminStats: () => apiRequest("GET", "/dashboard/admin-stats"),
};

// Points API
export const pointsAPI = {
  getUserHistory: () => apiRequest("GET", "/points/history"),
  
  getBalance: () => apiRequest("GET", "/points/balance"),
};

// Leaderboard API (corrected name)
export const leaderboardAPI = {
  get: (params?: { timeFrame?: string; category?: string }) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest("GET", `/leaderboard${query}`);
  },
};

// History API
export const historyAPI = {
  getActionLogs: () => apiRequest("GET", "/history/actions"),
};


