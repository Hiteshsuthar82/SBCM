import axios, { AxiosResponse } from "axios";
import { API_BASE_URL } from "./constants";
import { useAuthStore } from "./stores/auth";
import { toast } from "@/hooks/use-toast";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      useAuthStore.getState().logout();
      window.location.href = "/login";
    } else if (error.response?.status === 403) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
    } else if (error.response?.status === 429) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Too many requests. Please try again later.",
        variant: "destructive",
      });
    } else if (error.response?.status >= 500) {
      toast({
        title: "Server Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } else if (error.response?.status >= 400) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.msg ||
        "Request failed";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
    return Promise.reject(error);
  },
);

export default api;

// API helper functions
export const apiRequest = async <T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  url: string,
  data?: any,
  config?: any,
): Promise<T> => {
  try {
    const response = await api.request<T>({
      method,
      url,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Request failed";
  }
};

export const uploadFile = async (
  url: string,
  formData: FormData,
  method: "POST" | "PUT" = "POST",
): Promise<any> => {
  try {
    const response = await api.request({
      method,
      url,
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error.message || "Upload failed";
  }
};
