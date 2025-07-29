export interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  placement: "top" | "bottom" | "left" | "right";
  action?: {
    type: "click" | "navigate";
    href?: string;
  };
}

export interface TourConfig {
  id: string;
  name: string;
  description: string;
  steps: TourStep[];
  requiredRoles: string[];
  enabled: boolean;
  autoStart: boolean;
  showForNewUsers: boolean;
  showForReturningUsers: boolean;
}

export interface TourPermission {
  role: string;
  canViewTour: boolean;
  canManageTour: boolean;
  availableTours: string[];
}

export const DEFAULT_TOUR_CONFIGS: TourConfig[] = [
  {
    id: "user-onboarding",
    name: "User Onboarding",
    description: "Introduction tour for new users",
    enabled: true,
    autoStart: true,
    showForNewUsers: true,
    showForReturningUsers: false,
    requiredRoles: ["user"],
    steps: [
      {
        id: "welcome",
        title: "Welcome to Surat BRTS",
        description: "Welcome to the BRTS Complaint Management System",
        target: ".dashboard-welcome",
        placement: "bottom",
      },
      {
        id: "create-complaint",
        title: "Create Your First Complaint",
        description: "Click here to report issues with BRTS services",
        target: "[data-tour='create-complaint']",
        placement: "bottom",
        action: {
          type: "navigate",
          href: "/complaint/create",
        },
      },
      {
        id: "track-complaint",
        title: "Track Your Complaints",
        description: "Monitor the status of your submitted complaints",
        target: "[data-tour='track-complaint']",
        placement: "bottom",
      },
      {
        id: "points-system",
        title: "Earn Points",
        description: "Earn points for valid complaints and redeem rewards",
        target: "[data-tour='points']",
        placement: "left",
      },
    ],
  },
  {
    id: "admin-onboarding",
    name: "Admin Onboarding",
    description: "Introduction tour for new administrators",
    enabled: true,
    autoStart: true,
    showForNewUsers: true,
    showForReturningUsers: false,
    requiredRoles: ["admin", "super_admin"],
    steps: [
      {
        id: "admin-welcome",
        title: "Welcome Admin",
        description: "Welcome to the BRTS Admin Dashboard",
        target: ".admin-dashboard-welcome",
        placement: "bottom",
      },
      {
        id: "manage-complaints",
        title: "Manage Complaints",
        description: "Review and approve user complaints",
        target: "[data-tour='admin-complaints']",
        placement: "bottom",
      },
      {
        id: "system-config",
        title: "System Configuration",
        description: "Configure system settings and permissions",
        target: "[data-tour='admin-config']",
        placement: "bottom",
      },
      {
        id: "user-management",
        title: "User Management",
        description: "Manage users and their permissions",
        target: "[data-tour='admin-users']",
        placement: "bottom",
      },
    ],
  },
  {
    id: "super-admin-advanced",
    name: "Super Admin Advanced Features",
    description: "Advanced features for super administrators",
    enabled: true,
    autoStart: false,
    showForNewUsers: true,
    showForReturningUsers: true,
    requiredRoles: ["super_admin"],
    steps: [
      {
        id: "role-management",
        title: "Role Management",
        description: "Create and manage admin roles and permissions",
        target: "[data-tour='admin-roles']",
        placement: "bottom",
      },
      {
        id: "advanced-config",
        title: "Advanced Configuration",
        description: "Configure complaint types, forms, and system behavior",
        target: "[data-tour='advanced-config']",
        placement: "bottom",
      },
      {
        id: "reports-analytics",
        title: "Reports & Analytics",
        description: "Generate reports and view system analytics",
        target: "[data-tour='reports']",
        placement: "bottom",
      },
    ],
  },
];

export const DEFAULT_TOUR_PERMISSIONS: TourPermission[] = [
  {
    role: "user",
    canViewTour: true,
    canManageTour: false,
    availableTours: ["user-onboarding"],
  },
  {
    role: "admin",
    canViewTour: true,
    canManageTour: false,
    availableTours: ["admin-onboarding"],
  },
  {
    role: "super_admin",
    canViewTour: true,
    canManageTour: true,
    availableTours: [
      "user-onboarding",
      "admin-onboarding",
      "super-admin-advanced",
    ],
  },
];
