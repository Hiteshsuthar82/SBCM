import { apiRequest } from "../api";
import { SystemConfig } from "../types";
import { useConfigStore } from "../stores/config";

export const configService = {
  // Fetch system configuration
  getConfig: async (): Promise<SystemConfig> => {
    try {
      const config = await apiRequest<SystemConfig>("GET", "/config");
      useConfigStore.getState().setConfig(config);
      return config;
    } catch (error) {
      // Silently handle network errors in demo mode
      throw error;
    }
  },

  // Update system configuration (admin only)
  updateConfig: async (key: string, value: any): Promise<void> => {
    try {
      await apiRequest("PUT", "/config", { key, value });
      useConfigStore.getState().updateConfigField(key, value);
    } catch (error) {
      console.error("Failed to update config:", error);
      throw error;
    }
  },

  // Initialize config on app start (admin only)
  initializeConfig: async (): Promise<void> => {
    try {
      useConfigStore.getState().setLoading(true);
      await configService.getConfig();
    } catch (error: any) {
      // Silently fall back to default config in demo mode
      // No error messages shown to user
      useConfigStore.getState().setError(null);
    } finally {
      useConfigStore.getState().setLoading(false);
    }
  },
};

// Hook for using config in components
export function useConfig() {
  const { config, loading, error } = useConfigStore();

  // Always use config if available, otherwise fall back to defaults
  const activeConfig = config || {
    enableRewards: true,
    enableLeaderboards: true,
    enableNotifications: true,
    enableLocationTracking: true,
    enableLikeDislike: true,
    stopType: "dropdown" as const,
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

  const isFeatureEnabled = (feature: keyof SystemConfig): boolean => {
    return Boolean(activeConfig[feature]);
  };

  const getPointsConfig = () => {
    return activeConfig.pointsConfig;
  };

  const getApprovalHierarchy = (type: "complaint" | "withdrawal") => {
    return type === "complaint"
      ? activeConfig.complaintApprovalHierarchy
      : activeConfig.withdrawalApprovalHierarchy;
  };

  const getDynamicFields = () => {
    return activeConfig.dynamicFields;
  };

  const getMinWithdrawalLimit = () => {
    return activeConfig.minWithdrawalLimit;
  };

  const getStopType = () => {
    return activeConfig.stopType;
  };

  const isDateTimeRequired = () => {
    return activeConfig.dateTimeRequired;
  };

  const getComplaintTypes = () => {
    return (
      activeConfig.complaintTypes ||
      [
        {
          value: "bus_delay",
          label: "Bus Delay",
          color: "bg-yellow-500",
          enabled: true,
        },
        {
          value: "ticketless_travel",
          label: "Ticketless Travel",
          color: "bg-red-500",
          enabled: true,
        },
        {
          value: "cleanliness",
          label: "Cleanliness Issue",
          color: "bg-blue-500",
          enabled: true,
        },
        {
          value: "staff_behavior",
          label: "Staff Behavior",
          color: "bg-purple-500",
          enabled: true,
        },
        {
          value: "overcrowding",
          label: "Overcrowding",
          color: "bg-orange-500",
          enabled: true,
        },
        {
          value: "safety",
          label: "Safety Concern",
          color: "bg-red-600",
          enabled: true,
        },
        {
          value: "technical",
          label: "Technical Issue",
          color: "bg-gray-500",
          enabled: true,
        },
        {
          value: "other",
          label: "Other",
          color: "bg-green-500",
          enabled: true,
        },
      ].filter((type) => type.enabled)
    );
  };

  const shouldShowField = (fieldName: string) => {
    switch (fieldName) {
      case "dateTime":
        return activeConfig.showDateTimeField || false;
      case "location":
        return activeConfig.showLocationField || false;
      case "fileUpload":
        return activeConfig.showFileUploadField || false;
      default:
        return true;
    }
  };

  return {
    config: activeConfig,
    loading,
    error,
    isFeatureEnabled,
    getPointsConfig,
    getApprovalHierarchy,
    getDynamicFields,
    getMinWithdrawalLimit,
    getStopType,
    isDateTimeRequired,
    getComplaintTypes,
    shouldShowField,
  };
}
