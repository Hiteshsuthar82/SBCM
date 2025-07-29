import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConfig } from "@/lib/services/config";
import { useToast } from "@/hooks/use-toast";
import {
  Wallet,
  Coins,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  CreditCard,
  Smartphone,
  Building,
  Info,
  History,
} from "lucide-react";

const withdrawalSchema = z.object({
  points: z.number().min(1, "Amount must be greater than 0"),
  method: z.enum(["UPI", "Bank Transfer"], {
    required_error: "Please select a withdrawal method",
  }),
  upiId: z.string().optional(),
  bankAccount: z.string().optional(),
  ifsc: z.string().optional(),
  holderName: z.string().optional(),
});

type WithdrawalForm = z.infer<typeof withdrawalSchema>;

export default function WithdrawPoints() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getMinWithdrawalLimit } = useConfig();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState("");

  const minLimit = getMinWithdrawalLimit();
  const currentPoints = user?.points || 0;
  const maxWithdrawable = Math.floor(currentPoints);

  const form = useForm<WithdrawalForm>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      points: minLimit,
      method: "UPI",
    },
  });

  const watchedMethod = form.watch("method");
  const watchedPoints = form.watch("points");

  // Update validation based on method
  useEffect(() => {
    const method = form.getValues("method");

    if (method === "UPI") {
      form.setValue("bankAccount", "");
      form.setValue("ifsc", "");
      form.setValue("holderName", "");
    } else {
      form.setValue("upiId", "");
    }
  }, [watchedMethod, form]);

  const onSubmit = async (data: WithdrawalForm) => {
    setLoading(true);

    try {
      // Validate required fields based on method
      if (data.method === "UPI" && !data.upiId?.trim()) {
        toast({
          title: "Error",
          description: "UPI ID is required for UPI withdrawals",
          variant: "destructive",
        });
        return;
      }

      if (data.method === "Bank Transfer") {
        if (
          !data.bankAccount?.trim() ||
          !data.ifsc?.trim() ||
          !data.holderName?.trim()
        ) {
          toast({
            title: "Error",
            description: "All bank details are required for bank transfers",
            variant: "destructive",
          });
          return;
        }
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockWithdrawalId = "WDR" + Date.now().toString().slice(-6);
      setWithdrawalId(mockWithdrawalId);
      setSubmitted(true);

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request of ₹${data.points} has been submitted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit withdrawal request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto p-6">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Withdrawal Request Submitted!
                </h1>
                <p className="text-muted-foreground">
                  Your request is being processed by our team
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">Request ID</p>
                <p className="text-2xl font-bold font-mono">{withdrawalId}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Save this ID for tracking your request
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() =>
                    (window.location.href = APP_ROUTES.WITHDRAWAL_HISTORY)
                  }
                  className="w-full"
                >
                  <History className="h-4 w-4 mr-2" />
                  View Withdrawal History
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => (window.location.href = APP_ROUTES.DASHBOARD)}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Wallet className="h-8 w-8 text-primary" />
            Withdraw Points
          </h1>
          <p className="text-muted-foreground">
            Convert your reward points into cash
          </p>
        </div>

        {/* Current Balance Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                <span className="font-medium">Available Balance</span>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{currentPoints}</p>
                <p className="text-sm text-muted-foreground">points</p>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Equivalent to{" "}
                <span className="font-medium text-green-600">
                  ₹{currentPoints}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal Limits Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Minimum withdrawal: ₹{minLimit} • Maximum withdrawal: ₹
            {maxWithdrawable} • Processing time: 3-5 business days
          </AlertDescription>
        </Alert>

        {/* Withdrawal Form */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Amount Input */}
                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Withdrawal Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={minLimit}
                          max={maxWithdrawable}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum: ₹{minLimit}, Maximum: ₹{maxWithdrawable}
                      </FormDescription>
                      <FormMessage />
                      {watchedPoints > maxWithdrawable && (
                        <p className="text-sm text-red-600">
                          Amount exceeds your available balance
                        </p>
                      )}
                      {watchedPoints < minLimit && watchedPoints > 0 && (
                        <p className="text-sm text-red-600">
                          Amount below minimum withdrawal limit
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* Method Selection */}
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
                            <SelectValue placeholder="Select withdrawal method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="UPI">
                            <div className="flex items-center gap-2">
                              <Smartphone className="h-4 w-4" />
                              UPI Transfer
                            </div>
                          </SelectItem>
                          <SelectItem value="Bank Transfer">
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              Bank Transfer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* UPI Details */}
                {watchedMethod === "UPI" && (
                  <FormField
                    control={form.control}
                    name="upiId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UPI ID</FormLabel>
                        <FormControl>
                          <Input placeholder="yourname@upi" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter your UPI ID (e.g., username@paytm,
                          username@gpay)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Bank Details */}
                {watchedMethod === "Bank Transfer" && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="holderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Holder Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Full name as per bank account"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Account Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter account number"
                              {...field}
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
                            <Input placeholder="e.g., SBIN0000123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Processing Info */}
                {watchedPoints >= minLimit &&
                  watchedPoints <= maxWithdrawable && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="text-sm">
                          <h4 className="font-semibold text-blue-900 mb-1">
                            Processing Information
                          </h4>
                          <ul className="text-blue-700 space-y-1">
                            <li>
                              • Withdrawal requests are processed within 3-5
                              business days
                            </li>
                            <li>
                              • You'll receive notifications about status
                              updates
                            </li>
                            <li>
                              • Ensure your payment details are correct to avoid
                              delays
                            </li>
                            <li>• Contact support if you face any issues</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    loading ||
                    watchedPoints < minLimit ||
                    watchedPoints > maxWithdrawable ||
                    !watchedPoints
                  }
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Submit Withdrawal Request
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Additional Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() =>
              (window.location.href = APP_ROUTES.WITHDRAWAL_HISTORY)
            }
          >
            <History className="h-4 w-4 mr-2" />
            View History
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = APP_ROUTES.POINTS_HISTORY)}
          >
            <Coins className="h-4 w-4 mr-2" />
            Points History
          </Button>
        </div>
      </div>
    </Layout>
  );
}
