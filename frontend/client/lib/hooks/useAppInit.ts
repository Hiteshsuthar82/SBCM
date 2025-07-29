import { useEffect } from "react";
import { useAuth } from "./useAuth";
import { configService } from "../services/config";
import { fcmService } from "../services/fcm";

export function useAppInit() {
  const { isAuthenticated, user, admin } = useAuth();

  useEffect(() => {
    // Initialize app
    const initializeApp = async () => {
      try {
        // Initialize FCM if supported
        if (fcmService.isSupported()) {
          await fcmService.initialize();
        }

        console.log("App initialized successfully");
      } catch (error) {
        console.error("App initialization failed:", error);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    // Load config for admin users only
    const loadConfigForAdmin = async () => {
      if (isAuthenticated && admin) {
        try {
          await configService.initializeConfig();
        } catch (error) {
          // Silently handle config loading failures in demo mode
        }
      }
    };

    loadConfigForAdmin();
  }, [isAuthenticated, admin]);

  useEffect(() => {
    // Register FCM token when user logs in
    const registerFCMToken = async () => {
      if (isAuthenticated && (user || admin) && fcmService.isSupported()) {
        try {
          const hasPermission = await fcmService.requestPermission();
          if (hasPermission) {
            const userId = user?.id || admin?.id;
            if (userId) {
              await fcmService.registerToken(userId);
            }
          }
        } catch (error) {
          console.error("FCM token registration failed:", error);
        }
      }
    };

    registerFCMToken();
  }, [isAuthenticated, user, admin]);

  useEffect(() => {
    // Set up FCM message handler
    if (fcmService.isSupported()) {
      fcmService.onMessage((payload) => {
        console.log("FCM message received:", payload);

        // Show notification if supported
        if (payload.notification) {
          fcmService.showNotification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon || "/placeholder.svg",
            data: payload.data,
          });
        }
      });
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log("App is online");
    };

    const handleOffline = () => {
      console.log("App is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);
}
