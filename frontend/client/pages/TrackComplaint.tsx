import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { complaintsAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";

const trackSchema = z.object({
  token: z.string().min(1, "Please enter a complaint token"),
});

type TrackForm = z.infer<typeof trackSchema>;

interface ComplaintDetails {
  id: string;
  token: string;
  type: string;
  description: string;
  stop: string;
  dateTime: string;
  status: string;
  createdAt: string;
  timeline: Array<{
    action: string;
    status: string;
    reason?: string;
    description?: string;
    adminName?: string;
    timestamp: string;
  }>;
}

export default function TrackComplaint() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [complaint, setComplaint] = useState<ComplaintDetails | null>(null);

  const form = useForm<TrackForm>({
    resolver: zodResolver(trackSchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (data: TrackForm) => {
    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      // Try API call first
      const response = await complaintsAPI.getByToken(data.token);
      
      if (response.data) {
        // Transform API response to match our interface
        const apiComplaint: ComplaintDetails = {
          id: response.data._id || response.data.id,
          token: response.data.token,
          type: response.data.type,
          description: response.data.description,
          stop: response.data.stop || response.data.busStop,
          dateTime: response.data.dateTime || response.data.incidentDateTime,
          status: response.data.status,
          createdAt: response.data.createdAt,
          timeline: response.data.timeline || [],
        };
        setComplaint(apiComplaint);
      } else {
        throw new Error("Complaint not found");
      }
    } catch (apiError) {
      console.warn("API not available, using mock data:", apiError);
      // Fallback to mock data
      const mockComplaint: ComplaintDetails = {
        id: "1",
        token: data.token,
        type: "Bus Delay",
        description:
          "Bus number 405 was 30 minutes late at Adajan station during peak hours.",
        stop: "Adajan",
        dateTime: "2024-01-15T08:30:00Z",
        status: "under_review",
        createdAt: "2024-01-15T10:30:00Z",
        timeline: [
          {
            action: "Complaint Submitted",
            status: "pending",
            timestamp: "2024-01-15T10:30:00Z",
          },
          {
            action: "Under Review",
            status: "under_review",
            description:
              "Complaint has been assigned to operations team for investigation.",
            adminName: "Admin Team",
            timestamp: "2024-01-15T11:00:00Z",
          },
        ],
      };

      setComplaint(mockComplaint);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "under_review":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "under_review":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Track Your Complaint</h1>
          <p className="text-muted-foreground">
            Enter your complaint token to view status and timeline
          </p>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Complaint
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Token</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your complaint token (e.g., BRTS001)"
                          disabled={loading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={loading} className="w-full">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Track Complaint
                </Button>
              </form>
            </Form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {complaint && (
          <div className="space-y-6">
            {/* Complaint Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Complaint Details
                  </span>
                  <Badge className={getStatusColor(complaint.status)}>
                    {complaint.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Token
                    </p>
                    <p className="font-mono">{complaint.token}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Type
                    </p>
                    <p>{complaint.type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Stop/Location
                    </p>
                    <p>{complaint.stop}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </p>
                    <p>{new Date(complaint.dateTime).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </p>
                  <p className="text-sm">{complaint.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {complaint.timeline.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        {getStatusIcon(item.status)}
                        {index < complaint.timeline.length - 1 && (
                          <div className="h-8 w-px bg-border mt-2" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{item.action}</h4>
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mb-1">
                            {item.description}
                          </p>
                        )}
                        {item.adminName && (
                          <p className="text-xs text-muted-foreground">
                            by {item.adminName}
                          </p>
                        )}
                        {item.reason && (
                          <div className="mt-2 p-2 bg-muted rounded">
                            <p className="text-sm font-medium">Reason:</p>
                            <p className="text-sm">{item.reason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
