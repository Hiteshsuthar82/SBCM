export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const APP_ROUTES = {
  // Public routes
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  TRACK_COMPLAINT: "/track",
  ANNOUNCEMENTS: "/announcements",
  RULES: "/rules",

  // User routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  CREATE_COMPLAINT: "/complaint/create",
  COMPLAINT_HISTORY: "/complaint/history",
  POINTS_HISTORY: "/points-history",
  WITHDRAWAL: "/withdrawal",
  WITHDRAW_POINTS: "/withdraw",
  WITHDRAWAL_HISTORY: "/withdrawal-history",
  LEADERBOARDS: "/leaderboards",

  // Admin routes
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_COMPLAINTS: "/admin/complaints",
  ADMIN_ANNOUNCEMENTS: "/admin/announcements",
  ADMIN_RULES: "/admin/rules",
  ADMIN_WITHDRAWALS: "/admin/withdrawals",
  ADMIN_ROLES: "/admin/roles",
  ADMIN_USERS: "/admin/users",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_HISTORY: "/admin/history",
  ADMIN_CONFIG: "/admin/config",
  ADMIN_ANALYTICS: "/admin/analytics",
} as const;

export const USER_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
  EDITOR: "editor",
  READ_ONLY: "read_only",
} as const;

export const COMPLAINT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
} as const;

export const WITHDRAWAL_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  PROCESSING: "processing",
} as const;

export const LANGUAGES = {
  EN: "en",
  HI: "hi",
  GU: "gu",
} as const;

export const LANGUAGE_NAMES = {
  [LANGUAGES.EN]: "English",
  [LANGUAGES.HI]: "हिन्दी",
  [LANGUAGES.GU]: "ગુજરાતી",
} as const;
