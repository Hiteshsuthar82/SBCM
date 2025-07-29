import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Calendar,
  Activity,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import QuickTour, { useQuickTour } from "@/components/QuickTour";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  PieChart,
  LineChart,
  BarChart,
  AreaChart,
} from "@/components/charts/ChartComponents";
import { analyticsAPI } from "@/lib/services/api";

// Mock data for dashboard statistics
const mockStats = {
  totalComplaints: 2847,
  pendingComplaints: 156,
  resolvedComplaints: 2156,
  rejectedComplaints: 535,
  totalUsers: 1234,
  activeUsers: 856,
  totalPoints: 45780,
  totalWithdrawals: 1840,
  pendingWithdrawals: 23,
  resolutionRate: 94.2,
  avgResolutionTime: 2.3, // in days
  satisfactionScore: 4.2, // out of 5
};

const complaintsData = [
  { month: "Jan", submitted: 245, resolved: 230, pending: 15 },
  { month: "Feb", submitted: 312, resolved: 295, pending: 17 },
  { month: "Mar", submitted: 287, resolved: 270, pending: 17 },
  { month: "Apr", submitted: 423, resolved: 380, pending: 43 },
  { month: "May", submitted: 356, resolved: 340, pending: 16 },
  { month: "Jun", submitted: 398, resolved: 375, pending: 23 },
];

const complaintTypesData = [
  { name: "Bus Delay", value: 35, color: "#ef4444" },
  { name: "Cleanliness", value: 25, color: "#3b82f6" },
  { name: "Ticketless Travel", value: 20, color: "#f59e0b" },
  { name: "Staff Behavior", value: 12, color: "#10b981" },
  { name: "Technical", value: 8, color: "#8b5cf6" },
];

const recentActivity = [
  {
    id: 1,
    type: "complaint_approved",
    user: "Rajesh Kumar",
    description: "Approved complaint BRTS001",
    time: "2 minutes ago",
    status: "success",
  },
  {
    id: 2,
    type: "withdrawal_processed",
    user: "Priya Sharma",
    description: "Processed withdrawal WD045",
    time: "15 minutes ago",
    status: "success",
  },
  {
    id: 3,
    type: "complaint_submitted",
    user: "Amit Patel",
    description: "New complaint BRTS156",
    time: "32 minutes ago",
    status: "pending",
  },
  {
    id: 4,
    type: "user_registered",
    user: "Sneha Joshi",
    description: "New user registration",
    time: "1 hour ago",
    status: "info",
  },
];

export default function AdminDashboard() {
  const { admin } = useAuth();
  const { showTour, closeTour } = useQuickTour("admin");
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        // Load analytics data from API
        const response = await analyticsAPI.getDashboardStats({ timeRange });
        
        if (response.data) {
          // Use API data if available
          console.log("Dashboard data loaded from API:", response.data);
          // You can set state with API data here when the backend provides it
        }
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Continue with mock data (already defined in mockStats)
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [timeRange]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "complaint_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "withdrawal_processed":
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case "complaint_submitted":
        return <MessageSquare className="h-4 w-4 text-yellow-500" />;
      case "user_registered":
        return <Users className="h-4 w-4 text-purple-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <LayoutDashboard className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {admin?.name}! Here's your SBCMS overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Complaints
                  </p>
                  <p className="text-3xl font-bold">
                    {mockStats.totalComplaints.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+12.3%</span>
                    <span className="text-sm text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Users
                  </p>
                  <p className="text-3xl font-bold">
                    {mockStats.activeUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+8.1%</span>
                    <span className="text-sm text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Resolution Rate
                  </p>
                  <p className="text-3xl font-bold">
                    {mockStats.resolutionRate}%
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">+2.4%</span>
                    <span className="text-sm text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold">
                    {mockStats.pendingComplaints}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">-5.2%</span>
                    <span className="text-sm text-muted-foreground">
                      from last week
                    </span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Complaints Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <AreaChart
                  data={complaintsData.map((item) => ({
                    name: item.month,
                    submitted: item.submitted,
                    resolved: item.resolved,
                    pending: item.pending,
                  }))}
                  width={"100%"}
                  height={300}
                  dataKeys={[
                    { key: "submitted", color: "#3b82f6", name: "Submitted" },
                    { key: "resolved", color: "#10b981", name: "Resolved" },
                    { key: "pending", color: "#f59e0b", name: "Pending" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complaint Types Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Complaint Types Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <PieChart
                  data={complaintTypesData.map((item) => ({
                    name: item.name,
                    value: item.value,
                    fill: item.color,
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

        {/* Performance Metrics and Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <BarChart
                  data={[
                    {
                      name: "Resolution Time",
                      value: Math.round(
                        (mockStats.avgResolutionTime / 5) * 100,
                      ),
                      target: 80,
                    },
                    {
                      name: "Satisfaction",
                      value: Math.round(
                        (mockStats.satisfactionScore / 5) * 100,
                      ),
                      target: 85,
                    },
                    {
                      name: "Resolution Rate",
                      value: mockStats.resolutionRate,
                      target: 95,
                    },
                  ]}
                  width={"100%"}
                  height={250}
                  dataKeys={[
                    { key: "value", color: "#3b82f6", name: "Current" },
                    { key: "target", color: "#10b981", name: "Target" },
                  ]}
                />
              </div>
              <div className="pt-4 border-t mt-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {mockStats.resolvedComplaints}
                    </p>
                    <p className="text-xs text-muted-foreground">Resolved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">
                      {mockStats.pendingComplaints}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{activity.user}</p>
                        <span
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Complaints Status</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Resolved</span>
                    </div>
                    <span className="text-sm font-medium">
                      {mockStats.resolvedComplaints}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="text-sm font-medium">
                      {mockStats.pendingComplaints}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Rejected</span>
                    </div>
                    <span className="text-sm font-medium">
                      {mockStats.rejectedComplaints}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">User Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="text-sm font-medium">
                      {mockStats.totalUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Users</span>
                    <span className="text-sm font-medium">
                      {mockStats.activeUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Engagement Rate</span>
                    <span className="text-sm font-medium">69.3%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Financial Overview</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Points</span>
                    <span className="text-sm font-medium">
                      {mockStats.totalPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Points Redeemed</span>
                    <span className="text-sm font-medium">
                      {mockStats.totalWithdrawals}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending Withdrawals</span>
                    <Badge variant="secondary">
                      {mockStats.pendingWithdrawals}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Tour */}
      <QuickTour isOpen={showTour} onClose={closeTour} userType="admin" />
    </Layout>
  );
}
