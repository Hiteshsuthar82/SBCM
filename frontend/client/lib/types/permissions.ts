// Granular permission system for SBCMS
export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  isRequired: boolean; // Cannot be removed from roles
  dependsOn?: string[]; // Requires other permissions
  subPermissions?: SubPermission[];
}

export interface SubPermission {
  id: string;
  name: string;
  description: string;
  default: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  subPermissions: { [key: string]: string[] }; // permission_id -> sub_permission_ids
  isDefault: boolean;
  isSystem: boolean; // Cannot be deleted
  createdAt: string;
  updatedAt: string;
}

export const PERMISSION_CATEGORIES = {
  COMPLAINTS: "Complaints",
  USERS: "Users",
  ADMINS: "Admins",
  CONFIGURATION: "Configuration",
  CONTENT: "Content",
  REPORTS: "Reports",
  TOURS: "Tours",
  SYSTEM: "System",
} as const;

export const GRANULAR_PERMISSIONS: Permission[] = [
  // Complaints
  {
    id: "viewComplaints",
    name: "View Complaints",
    description: "View all complaints in the system",
    category: PERMISSION_CATEGORIES.COMPLAINTS,
    isRequired: true,
  },
  {
    id: "manageComplaints",
    name: "Manage Complaints",
    description: "Approve, reject, and manage complaints",
    category: PERMISSION_CATEGORIES.COMPLAINTS,
    isRequired: false,
    dependsOn: ["viewComplaints"],
    subPermissions: [
      {
        id: "approveComplaints",
        name: "Approve Complaints",
        description: "Approve complaint submissions",
        default: true,
      },
      {
        id: "rejectComplaints",
        name: "Reject Complaints",
        description: "Reject complaint submissions",
        default: true,
      },
      {
        id: "assignComplaints",
        name: "Assign Complaints",
        description: "Assign complaints to other admins",
        default: false,
      },
      {
        id: "revertComplaints",
        name: "Revert Decisions",
        description: "Revert complaint decisions (Super Admin)",
        default: false,
      },
    ],
  },

  // Users
  {
    id: "viewUsers",
    name: "View Users",
    description: "View user profiles and information",
    category: PERMISSION_CATEGORIES.USERS,
    isRequired: true,
  },
  {
    id: "manageUsers",
    name: "Manage Users",
    description: "Manage user accounts and activities",
    category: PERMISSION_CATEGORIES.USERS,
    isRequired: false,
    dependsOn: ["viewUsers"],
    subPermissions: [
      {
        id: "activateUsers",
        name: "Activate/Deactivate Users",
        description: "Enable or disable user accounts",
        default: true,
      },
      {
        id: "viewUserActivity",
        name: "View User Activity",
        description: "View user activity logs and details",
        default: true,
      },
      {
        id: "editUserProfiles",
        name: "Edit User Profiles",
        description: "Modify user profile information",
        default: false,
      },
      {
        id: "deleteUsers",
        name: "Delete Users",
        description: "Permanently delete user accounts",
        default: false,
      },
    ],
  },

  // Admins
  {
    id: "viewAdmins",
    name: "View Admins",
    description: "View admin profiles and roles",
    category: PERMISSION_CATEGORIES.ADMINS,
    isRequired: false,
  },
  {
    id: "manageAdmins",
    name: "Manage Admins",
    description: "Manage admin accounts and roles",
    category: PERMISSION_CATEGORIES.ADMINS,
    isRequired: false,
    dependsOn: ["viewAdmins"],
    subPermissions: [
      {
        id: "createAdmins",
        name: "Create Admins",
        description: "Create new admin accounts",
        default: false,
      },
      {
        id: "editAdminRoles",
        name: "Change Admin Roles",
        description: "Modify admin roles and permissions",
        default: false,
      },
      {
        id: "activateAdmins",
        name: "Activate/Deactivate Admins",
        description: "Enable or disable admin accounts",
        default: true,
      },
      {
        id: "viewAdminActivity",
        name: "View Admin Activity",
        description: "View admin activity logs",
        default: true,
      },
    ],
  },

  // Configuration
  {
    id: "updateConfig",
    name: "Update Configuration",
    description: "Update system configuration",
    category: PERMISSION_CATEGORIES.CONFIGURATION,
    isRequired: false,
    subPermissions: [
      {
        id: "configGeneral",
        name: "General Settings",
        description: "Modify general system settings",
        default: true,
      },
      {
        id: "configFeatures",
        name: "Feature Toggles",
        description: "Enable/disable system features",
        default: true,
      },
      {
        id: "configComplaintTypes",
        name: "Complaint Types",
        description: "Manage complaint types and categories",
        default: false,
      },
      {
        id: "configBusStops",
        name: "Bus Stops",
        description: "Manage bus stop listings",
        default: false,
      },
      {
        id: "configRulesCategories",
        name: "Rules Categories",
        description: "Manage rules and categories",
        default: false,
      },
      {
        id: "configPointsSystem",
        name: "Points System",
        description: "Configure points and rewards",
        default: false,
      },
      {
        id: "configApprovalHierarchy",
        name: "Approval Hierarchy",
        description: "Configure approval workflows",
        default: false,
      },
      {
        id: "configFormFields",
        name: "Form Fields",
        description: "Configure dynamic form fields",
        default: false,
      },
    ],
  },

  // Content
  {
    id: "manageAnnouncements",
    name: "Manage Announcements",
    description: "Create and manage announcements",
    category: PERMISSION_CATEGORIES.CONTENT,
    isRequired: false,
  },
  {
    id: "manageRules",
    name: "Manage Rules",
    description: "Create and manage rules",
    category: PERMISSION_CATEGORIES.CONTENT,
    isRequired: false,
  },

  // Reports
  {
    id: "viewReports",
    name: "View Reports",
    description: "View system reports and analytics",
    category: PERMISSION_CATEGORIES.REPORTS,
    isRequired: false,
    subPermissions: [
      {
        id: "generateReports",
        name: "Generate Reports",
        description: "Generate new reports",
        default: true,
      },
      {
        id: "exportReports",
        name: "Export Reports",
        description: "Export reports to various formats",
        default: true,
      },
      {
        id: "scheduleReports",
        name: "Schedule Reports",
        description: "Schedule automated reports",
        default: false,
      },
    ],
  },

  // Tours
  {
    id: "manageTours",
    name: "Manage Tours",
    description: "Manage quick tours and onboarding",
    category: PERMISSION_CATEGORIES.TOURS,
    isRequired: false,
    subPermissions: [
      {
        id: "createTours",
        name: "Create Tours",
        description: "Create new quick tours",
        default: false,
      },
      {
        id: "assignTours",
        name: "Assign Tours",
        description: "Assign tours to roles",
        default: true,
      },
      {
        id: "configureTours",
        name: "Configure Tours",
        description: "Configure tour settings",
        default: true,
      },
    ],
  },

  // System
  {
    id: "manageRoles",
    name: "Manage Roles",
    description: "Create and manage user roles",
    category: PERMISSION_CATEGORIES.SYSTEM,
    isRequired: false,
  },
  {
    id: "viewHistory",
    name: "View History",
    description: "View system action history",
    category: PERMISSION_CATEGORIES.SYSTEM,
    isRequired: false,
  },
  {
    id: "viewAnalytics",
    name: "View Analytics",
    description: "View system analytics and charts",
    category: PERMISSION_CATEGORIES.SYSTEM,
    isRequired: false,
  },
];

export const DEFAULT_ROLES: Role[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full system access with all permissions",
    permissions: GRANULAR_PERMISSIONS.map((p) => p.id),
    subPermissions: Object.fromEntries(
      GRANULAR_PERMISSIONS.filter((p) => p.subPermissions).map((p) => [
        p.id,
        p.subPermissions!.map((sp) => sp.id),
      ]),
    ),
    isDefault: true,
    isSystem: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Standard admin with basic permissions",
    permissions: [
      "viewComplaints",
      "manageComplaints",
      "viewUsers",
      "manageAnnouncements",
      "manageRules",
      "viewReports",
    ],
    subPermissions: {
      manageComplaints: ["approveComplaints", "rejectComplaints"],
      manageUsers: ["activateUsers", "viewUserActivity"],
      viewReports: ["generateReports", "exportReports"],
    },
    isDefault: true,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sub_admin",
    name: "Sub Admin",
    description: "Limited admin with restricted permissions",
    permissions: ["viewComplaints", "manageComplaints", "viewUsers"],
    subPermissions: {
      manageComplaints: ["approveComplaints"],
      manageUsers: ["viewUserActivity"],
    },
    isDefault: true,
    isSystem: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
