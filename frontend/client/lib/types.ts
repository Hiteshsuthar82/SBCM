export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  aadhaar?: string;
  profession?: string;
  language: string;
  photo?: string;
  points: number;
  paymentDetails?: {
    upiId?: string;
    bankAccount?: string;
    ifsc?: string;
  };
  progress: number;
  isAdmin: boolean;
  role?: string;
  permissions?: string[];
}

export interface Admin {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name: string;
}

export interface Complaint {
  id: string;
  token: string;
  type: string;
  description: string;
  stop: string;
  dateTime: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  evidence: string[];
  status: string;
  reason?: string;
  adminDescription?: string;
  timeline: ComplaintTimeline[];
  points?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintTimeline {
  action: string;
  status: string;
  reason?: string;
  description?: string;
  adminId?: string;
  adminName?: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  route?: string;
  scheduledAt?: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  createdAt: string;
}

export interface Rule {
  id: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  points: number;
  method: string;
  status: string;
  reason?: string;
  description?: string;
  paymentDetails?: any;
  timeline: WithdrawalTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalTimeline {
  action: string;
  status: string;
  reason?: string;
  description?: string;
  adminId?: string;
  adminName?: string;
  timestamp: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  complaintsCount: number;
  rank: number;
}

export interface SystemConfig {
  enableRewards: boolean;
  enableLeaderboards: boolean;
  enableNotifications: boolean;
  enableLocationTracking: boolean;
  enableLikeDislike: boolean;
  stopType: "dropdown" | "text";
  dateTimeRequired: boolean;
  showDateTimeField: boolean;
  showLocationField: boolean;
  showFileUploadField: boolean;
  minWithdrawalLimit: number;
  complaintApprovalHierarchy: string[];
  withdrawalApprovalHierarchy: string[];
  complaintTypes: Array<{
    value: string;
    label: string;
    color: string;
    enabled: boolean;
  }>;
  pointsConfig: {
    complaintSubmission: number;
    complaintApproval: number;
    enableSubmissionPoints: boolean;
  };
  dynamicFields: {
    [key: string]: {
      type: string;
      required: boolean;
      options?: string[];
      visible: boolean;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
