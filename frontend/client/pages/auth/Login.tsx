import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Phone, Key } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { authAPI } from "@/lib/services/api";
import { APP_ROUTES } from "@/lib/constants";

const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid mobile number"),
  otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      mobile: "",
      otp: "",
    },
  });

  const sendOtp = async () => {
    const mobile = form.getValues("mobile");
    if (!mobile || mobile.length !== 10) {
      form.setError("mobile", { message: "Enter a valid mobile number" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      try {
        // Try to send OTP via API for existing user login
        const response = await authAPI.sendLoginOtp({ mobile });
        setSessionId(response.data.sessionId);
        setOtpSent(true);
      } catch (apiError) {
        console.warn("OTP API not available, using mock mode");
        setSessionId("login-session-" + Date.now());
        setOtpSent(true);
        // Auto-fill OTP in development mode when API is not available
        form.setValue("otp", "123456");
      }
    } catch (error: any) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      await login(data.mobile, data.otp, sessionId);
      const from =
        (location.state as any)?.from?.pathname || APP_ROUTES.DASHBOARD;
      navigate(from, { replace: true });
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <p className="text-muted-foreground">Sign in to your SBCMS account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          placeholder="Enter your mobile number"
                          className="pl-10"
                          disabled={otpSent || loading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!otpSent ? (
                <Button
                  type="button"
                  onClick={sendOtp}
                  disabled={loading}
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send OTP
                </Button>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              {...field}
                              placeholder="Enter 6-digit OTP"
                              className="pl-10"
                              maxLength={6}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 mt-2">
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            Development Mode
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            API integration ready. Use OTP:{" "}
                            <span className="font-mono font-bold">123456</span>{" "}
                            when backend is not running
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Sign In
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setOtpSent(false);
                      setSessionId("");
                      form.setValue("otp", "");
                    }}
                    className="w-full"
                  >
                    Change Mobile Number
                  </Button>
                </>
              )}
            </form>
          </Form>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to={APP_ROUTES.REGISTER}
                className="text-primary hover:underline font-medium"
              >
                Register here
              </Link>
            </p>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue as
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link to={APP_ROUTES.TRACK_COMPLAINT}>Track Complaint</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={APP_ROUTES.ANNOUNCEMENTS}>View News</Link>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Admin?{" "}
              <Link
                to={APP_ROUTES.ADMIN_LOGIN}
                className="text-primary hover:underline"
              >
                Admin Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
