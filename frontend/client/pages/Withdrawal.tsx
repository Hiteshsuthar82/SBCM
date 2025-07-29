import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Award,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  ArrowRight,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/lib/constants";

const withdrawalSchema = z.object({
  points: z
    .number()
    .min(100, "Minimum withdrawal is 100 points")
    .max(5000, "Maximum withdrawal is 5000 points"),
  method: z.enum(["upi", "bank"], {
    required_error: "Please select a withdrawal method",
  }),
  upiId: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

interface WithdrawalRequest {
  id: string;
  points: number;
  amount: number;
  method: string;
  status: "pending" | "approved" | "rejected" | "processing";
  createdAt: string;
  updatedAt: string;
  reason?: string;
}

const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: "WD001",
    points: 100,
    amount: 50,
    method: "UPI",
    status: "approved",
    createdAt: "2024-01-13T11:15:00Z",
    updatedAt: "2024-01-14T10:30:00Z",
  },
  {
    id: "WD002",
    points: 200,
    amount: 100,
    method: "Bank Transfer",
    status: "processing",
    createdAt: "2024-01-12T14:20:00Z",
    updatedAt: "2024-01-12T14:20:00Z",
  },
];

export default function Withdrawal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      points: 100,
      method: "upi",
      upiId: user?.paymentDetails?.upiId || "",
      bankAccount: user?.paymentDetails?.bankAccount || "",
      ifsc: user?.paymentDetails?.ifsc || "",
    },
  });

  const watchMethod = form.watch("method");
  const watchPoints = form.watch("points");

  useEffect(() => {
    setWithdrawals(mockWithdrawals);
  }, []);

  const conversionRate = 0.5; // 1 point = ₹0.50
  const minWithdrawal = 100;
  const maxWithdrawal = Math.min(user?.points || 0, 5000);
  const withdrawalAmount = watchPoints * conversionRate;

  const onSubmit = async (data: WithdrawalForm) => {
    if (!user?.paymentDetails?.upiId && !user?.paymentDetails?.bankAccount) {
      toast({
        title: "Payment Details Required",
        description: "Please add payment details in your profile first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newWithdrawal: WithdrawalRequest = {
        id: `WD${String(withdrawals.length + 1).padStart(3, "0")}`,
        points: data.points,
        amount: data.points * conversionRate,
        method: data.method === "upi" ? "UPI" : "Bank Transfer",
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setWithdrawals((prev) => [newWithdrawal, ...prev]);
      setSubmitted(true);

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your request for ₹${withdrawalAmount} has been submitted successfully.`,
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Gift className="h-8 w-8 text-green-500" />
            Withdraw Points
          </h1>
          <p className="text-muted-foreground">
            Convert your points to real cash rewards
          </p>
        </div>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Available Points</p>
              <p className="text-2xl font-bold">{user?.points || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Cash Value</p>
              <p className="text-2xl font-bold">
                ₹{((user?.points || 0) * conversionRate).toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-sm text-muted-foreground">Min. Withdrawal</p>
              <p className="text-2xl font-bold">{minWithdrawal} pts</p>
            </CardContent>
          </Card>
        </div>

        {submitted && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your withdrawal request has been submitted successfully! You'll
              receive a notification once it's processed.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <Card>
            <CardHeader>
              <CardTitle>New Withdrawal Request</CardTitle>
            </CardHeader>
            <CardContent>
              {(user?.points || 0) < minWithdrawal ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need at least {minWithdrawal} points to make a
                    withdrawal. Keep earning points by submitting complaints!
                  </AlertDescription>
                </Alert>
              ) : !user?.paymentDetails?.upiId &&
                !user?.paymentDetails?.bankAccount ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please add payment details in your{" "}
                    <Link
                      to={APP_ROUTES.PROFILE}
                      className="font-medium underline"
                    >
                      profile
                    </Link>{" "}
                    to make withdrawals.
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Points Selection */}
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points to Withdraw</FormLabel>
                          <FormControl>
                            <div className="space-y-4">
                              <Input
                                type="number"
                                min={minWithdrawal}
                                max={maxWithdrawal}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                              <div className="grid grid-cols-3 gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => field.onChange(100)}
                                >
                                  100
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => field.onChange(200)}
                                  disabled={maxWithdrawal < 200}
                                >
                                  200
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => field.onChange(maxWithdrawal)}
                                  disabled={maxWithdrawal < 100}
                                >
                                  Max
                                </Button>
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            You'll receive ₹{withdrawalAmount.toFixed(2)} (1
                            point = ₹{conversionRate})
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Withdrawal Method */}
                    <FormField
                      control={form.control}
                      name="method"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Withdrawal Method</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="upi">
                                <div className="flex items-center gap-2">
                                  <Smartphone className="h-4 w-4" />
                                  UPI (Instant)
                                </div>
                              </SelectItem>
                              <SelectItem value="bank">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4" />
                                  Bank Transfer (1-3 days)
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Payment Details */}
                    {watchMethod === "upi" && (
                      <FormField
                        control={form.control}
                        name="upiId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPI ID</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="yourname@paytm"
                                disabled={!!user?.paymentDetails?.upiId}
                              />
                            </FormControl>
                            <FormDescription>
                              {user?.paymentDetails?.upiId
                                ? "Using saved UPI ID from profile"
                                : "Enter your UPI ID"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {watchMethod === "bank" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="bankAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Account Number</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="Account number"
                                  disabled={!!user?.paymentDetails?.bankAccount}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="ifsc"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IFSC Code</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder="IFSC code"
                                  disabled={!!user?.paymentDetails?.ifsc}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}

                    {/* Conversion Preview */}
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Points to withdraw:</span>
                        <span className="font-bold">{watchPoints}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Conversion rate:</span>
                        <span className="font-bold">
                          1 point = ₹{conversionRate}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-lg font-bold border-t pt-2">
                        <span>You'll receive:</span>
                        <span className="text-green-600">
                          ₹{withdrawalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        (user?.points || 0) < minWithdrawal ||
                        watchPoints > maxWithdrawal
                      }
                      className="w-full"
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Withdrawal Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Withdrawal History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              {withdrawals.length > 0 ? (
                <div className="space-y-4">
                  {withdrawals.map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(withdrawal.status)}
                        <div>
                          <p className="font-medium text-sm">
                            {withdrawal.points} points
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {withdrawal.method} • {withdrawal.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          ₹{withdrawal.amount}
                        </p>
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={APP_ROUTES.POINTS_HISTORY}>
                      View All Transactions
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No withdrawals yet. Start earning points!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card>
          <CardHeader>
            <CardTitle>How Withdrawals Work</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <span className="font-bold text-blue-600">1</span>
                </div>
                <h3 className="font-semibold mb-2">Submit Request</h3>
                <p className="text-sm text-muted-foreground">
                  Choose points amount and payment method
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center mb-4">
                  <span className="font-bold text-yellow-600">2</span>
                </div>
                <h3 className="font-semibold mb-2">Admin Review</h3>
                <p className="text-sm text-muted-foreground">
                  Your request will be reviewed within 24 hours
                </p>
              </div>
              <div className="text-center">
                <div className="h-12 w-12 mx-auto rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <span className="font-bold text-green-600">3</span>
                </div>
                <h3 className="font-semibold mb-2">Receive Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Money transferred to your account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
