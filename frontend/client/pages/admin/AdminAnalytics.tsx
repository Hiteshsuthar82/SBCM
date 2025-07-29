import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { analyticsAPI } from "@/lib/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  PieChart,
  LineChart,
  BarChart,
  AreaChart,
} from "@/components/charts/ChartComponents";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Activity,
  Target,
  Award,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";

interface AnalyticsData {
  complaints: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    dailyTrend: { date: string; count: number }[];
    categoryBreakdown: {
      category: string;
      count: number;
      percentage: number;
    }[];
  };
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    retention: number;
    deviceBreakdown: { device: string; count: number; percentage: number }[];
  };
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    totalRequests: number;
    performanceScore: number;
  };
  withdrawals: {
    total: number;
    amount: number;
    pending: number;
    approved: number;
    averageAmount: number;
  };
  announcements: {
    total: number;
    views: number;
    likes: number;
    engagementRate: number;
  };
}

export default function AdminAnalytics() {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const response = await analyticsAPI.getDashboard();
        setAnalytics(response.data);
      } catch (error) {
        console.warn("API not available, using mock data:", error);

        // Mock analytics data
        const mockAnalytics: AnalyticsData = {
          complaints: {
            total: 2847,
            pending: 156,
            approved: 2435,
            rejected: 256,
            dailyTrend: [
              { date: "2024-01-09", count: 45 },
              { date: "2024-01-10", count: 52 },
              { date: "2024-01-11", count: 38 },
              { date: "2024-01-12", count: 65 },
              { date: "2024-01-13", count: 48 },
              { date: "2024-01-14", count: 72 },
              { date: "2024-01-15", count: 56 },
            ],
            categoryBreakdown: [
              { category: "Bus Delay", count: 1245, percentage: 43.7 },
              { category: "Overcrowding", count: 687, percentage: 24.1 },
              { category: "Driver Behavior", count: 425, percentage: 14.9 },
              { category: "Route Issues", count: 312, percentage: 11.0 },
              { category: "Cleanliness", count: 178, percentage: 6.3 },
            ],
          },
          users: {
            total: 15420,
            active: 12340,
            newThisMonth: 847,
            retention: 78.5,
            deviceBreakdown: [
              { device: "Mobile", count: 12840, percentage: 83.3 },
              { device: "Desktop", count: 1890, percentage: 12.3 },
              { device: "Tablet", count: 690, percentage: 4.4 },
            ],
          },
          system: {
            uptime: 99.8,
            responseTime: 245,
            errorRate: 0.12,
            totalRequests: 1250000,
            performanceScore: 94,
          },
          withdrawals: {
            total: 1243,
            amount: 124500,
            pending: 45,
            approved: 1198,
            averageAmount: 100.2,
          },
          announcements: {
            total: 47,
            views: 45200,
            likes: 3420,
            engagementRate: 7.6,
          },
        };

        setAnalytics(mockAnalytics);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!analytics) return null;

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Comprehensive analytics and insights for the Surat BRTS system
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await analyticsAPI.exportReport(
                    "dashboard",
                    dateRange,
                  );
                  // Handle file download
                  const blob = new Blob([response.data], {
                    type: "application/json",
                  });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `analytics-report-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                  toast({
                    title: "Success",
                    description: "Analytics report exported successfully.",
                  });
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to export analytics report.",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">
                    {analytics.users.total.toLocaleString()}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  +{analytics.users.newThisMonth}
                </span>
                <span className="text-muted-foreground ml-1">this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Complaints</p>
                  <p className="text-2xl font-bold">
                    {analytics.complaints.total.toLocaleString()}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  {(
                    (analytics.complaints.approved /
                      analytics.complaints.total) *
                    100
                  ).toFixed(1)}
                  %
                </span>
                <span className="text-muted-foreground ml-1">resolved</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Withdrawals</p>
                  <p className="text-2xl font-bold">
                    ₹{analytics.withdrawals.amount.toLocaleString()}
                  </p>
                </div>
                <Wallet className="h-8 w-8 text-green-500" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Target className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-blue-500">
                  ₹{analytics.withdrawals.averageAmount}
                </span>
                <span className="text-muted-foreground ml-1">avg amount</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold">
                    {analytics.system.performanceScore}%
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2 text-sm">
                <Clock className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">
                  {analytics.system.uptime}%
                </span>
                <span className="text-muted-foreground ml-1">uptime</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaint Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Daily Complaint Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <LineChart
                      data={analytics.complaints.dailyTrend.map((day) => ({
                        name: new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        }),
                        count: day.count,
                      }))}
                      width={"100%"}
                      height={300}
                      dataKeys={[
                        { key: "count", color: "#3b82f6", name: "Complaints" },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* System Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={[
                        {
                          name: "Uptime",
                          value: analytics.system.uptime,
                          target: 99.9,
                        },
                        {
                          name: "Performance",
                          value: analytics.system.performanceScore,
                          target: 95,
                        },
                        {
                          name: "Response",
                          value: Math.max(
                            0,
                            100 - analytics.system.responseTime / 10,
                          ),
                          target: 95,
                        },
                      ]}
                      width={"100%"}
                      height={300}
                      dataKeys={[
                        { key: "value", color: "#3b82f6", name: "Current" },
                        { key: "target", color: "#10b981", name: "Target" },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaint Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart
                      data={[
                        {
                          name: "Approved",
                          value: analytics.complaints.approved,
                          fill: "#10b981",
                        },
                        {
                          name: "Pending",
                          value: analytics.complaints.pending,
                          fill: "#f59e0b",
                        },
                        {
                          name: "Rejected",
                          value: analytics.complaints.rejected,
                          fill: "#ef4444",
                        },
                      ]}
                      width={"100%"}
                      height={300}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Category Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <BarChart
                      data={analytics.complaints.categoryBreakdown.map(
                        (category) => ({
                          name: category.category,
                          count: category.count,
                          percentage: category.percentage,
                        }),
                      )}
                      width={"100%"}
                      height={300}
                      dataKeys={[
                        { key: "count", color: "#3b82f6", name: "Count" },
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>User Growth Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <AreaChart
                      data={[
                        {
                          name: "Total",
                          total: analytics.users.total,
                          active: analytics.users.active,
                        },
                        {
                          name: "Active",
                          total: analytics.users.active,
                          active: analytics.users.active - 100,
                        },
                        {
                          name: "New",
                          total: analytics.users.newThisMonth,
                          active: analytics.users.newThisMonth,
                        },
                        {
                          name: "Retention",
                          total: analytics.users.retention,
                          active: analytics.users.retention - 5,
                        },
                      ]}
                      width={"100%"}
                      height={300}
                      dataKeys={[
                        { key: "total", color: "#3b82f6", name: "Total" },
                        { key: "active", color: "#10b981", name: "Active" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">
                        {analytics.users.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Total Users
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">
                        {analytics.users.retention}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Retention Rate
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Device Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Device Usage Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <PieChart
                      data={analytics.users.deviceBreakdown.map((device) => ({
                        name: device.device,
                        value: device.count,
                        fill:
                          device.device === "Mobile"
                            ? "#3b82f6"
                            : device.device === "Desktop"
                              ? "#10b981"
                              : "#f59e0b",
                      }))}
                      width={"100%"}
                      height={300}
                      showTooltip={true}
                      showLegend={true}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">System Uptime</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-green-500 mb-2">
                    {analytics.system.uptime}%
                  </div>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                  <Progress value={analytics.system.uptime} className="mt-4" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Response Time</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-2">
                    {analytics.system.responseTime}ms
                  </div>
                  <p className="text-sm text-muted-foreground">Average</p>
                  <Badge className="mt-4" variant="outline">
                    Excellent
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Error Rate</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {analytics.system.errorRate}%
                  </div>
                  <p className="text-sm text-muted-foreground">Last 24 hours</p>
                  <Badge className="mt-4" variant="outline">
                    Low
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Announcement Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle>Announcement Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Announcements</span>
                    <Badge variant="outline">
                      {analytics.announcements.total}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Views</span>
                    <Badge variant="outline">
                      {analytics.announcements.views.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Likes</span>
                    <Badge variant="outline">
                      {analytics.announcements.likes.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Rate</span>
                    <Badge className="bg-green-100 text-green-800">
                      {analytics.announcements.engagementRate}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawal Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Requests</span>
                    <Badge variant="outline">
                      {analytics.withdrawals.total}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Amount</span>
                    <Badge variant="outline">
                      ₹{analytics.withdrawals.amount.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Approval Rate</span>
                    <Badge className="bg-green-100 text-green-800">
                      {(
                        (analytics.withdrawals.approved /
                          analytics.withdrawals.total) *
                        100
                      ).toFixed(1)}
                      %
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Amount</span>
                    <Badge variant="outline">
                      ₹{analytics.withdrawals.averageAmount}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
