import { create } from "zustand";
import { SystemConfig } from "../types";

interface ConfigState {
  config: SystemConfig | null;
  loading: boolean;
  error: string | null;

  setConfig: (config: SystemConfig) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateConfigField: (key: string, value: any) => void;
}

const defaultConfig: SystemConfig = {
  enableRewards: true,
  enableLeaderboards: true,
  enableNotifications: true,
  enableLocationTracking: true,
  enableLikeDislike: true,
  stopType: "dropdown",
  dateTimeRequired: true,
  minWithdrawalLimit: 100,
  complaintApprovalHierarchy: ["admin"],
  withdrawalApprovalHierarchy: ["admin"],
  pointsConfig: {
    complaintSubmission: 10,
    complaintApproval: 50,
    enableSubmissionPoints: true,
  },
  dynamicFields: {},
};

export const useConfigStore = create<ConfigState>()((set) => ({
  config: defaultConfig,
  loading: false,
  error: null,

  setConfig: (config) => set(() => ({ config, error: null })),
  setLoading: (loading) => set(() => ({ loading })),
  setError: (error) => set(() => ({ error })),
  updateConfigField: (key, value) =>
    set((state) => ({
      config: state.config ? { ...state.config, [key]: value } : defaultConfig,
    })),
}));
