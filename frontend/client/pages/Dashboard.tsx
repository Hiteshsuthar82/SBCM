import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConfig } from "@/lib/services/config";
import { APP_ROUTES } from "@/lib/constants";
import QuickTour, { useQuickTour } from "@/components/QuickTour";
import {
  PieChart,
  LineChart,
  BarChart,
} from "@/components/charts/ChartComponents";
import {
  MessageSquare,
  Search,
  Megaphone,
  Trophy,
  Star,
  Plus,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
  History,
  BarChart3,
} from "lucide-react";
import { dashboardAPI, complaintsAPI, announcementsAPI } from "@/lib/services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const { isFeatureEnabled } = useConfig();
  const { showTour, closeTour } = useQuickTour("user");
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [userStats, setUserStats] = useState({
    monthlyPoints: [],
    complaintsByStatus: [],
    complaintsByType: [],
  });

  const quickActions = [
    {
      title: "New Complaint",
      description: "Report a new issue",
      icon: Plus,
      href: APP_ROUTES.CREATE_COMPLAINT,
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Track Complaint",
      description: "Check complaint status",
      icon: Search,
      href: APP_ROUTES.TRACK_COMPLAINT,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View History",
      description: "See all complaints",
      icon: Calendar,
      href: APP_ROUTES.COMPLAINT_HISTORY,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Withdraw Points",
      description: "Cash out rewards",
      icon: Wallet,
      href: APP_ROUTES.WITHDRAWAL,
      color: "bg-purple-500 hover:bg-purple-600",
      requiresRewards: true,
    },
    {
      title: "Points History",
      description: "Track your earnings",
      icon: History,
      href: APP_ROUTES.POINTS_HISTORY,
      color: "bg-indigo-500 hover:bg-indigo-600",
      requiresRewards: true,
    },
    {
      title: "Leaderboard",
      description: "Top contributors",
      icon: Trophy,
      href: APP_ROUTES.LEADERBOARDS,
      color: "bg-yellow-500 hover:bg-yellow-600",
    },
  ];

  // Filter quick actions based on feature toggles
  const availableQuickActions = quickActions.filter((action) => {
    if (action.href === APP_ROUTES.LEADERBOARDS) {
      return isFeatureEnabled("enableLeaderboards");
    }
    if (action.requiresRewards) {
      return isFeatureEnabled("enableRewards");
    }
    return true; // All other actions are always available
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load user dashboard stats
        const statsResponse = await dashboardAPI.getUserStats();
        if (statsResponse.data) {
          setUserStats({
            totalComplaints: statsResponse.data.totalComplaints || 0,
            approvedComplaints: statsResponse.data.approvedComplaints || 0,
            totalPoints: statsResponse.data.totalPoints || 0,
            currentRank: statsResponse.data.currentRank || 0,
            level: statsResponse.data.level || 1,
            progress: statsResponse.data.progress || 0,
          });
        }

        // Load recent complaints
        const complaintsResponse = await complaintsAPI.getUserComplaints({ limit: 3 });
        const transformedComplaints = complaintsResponse.data?.slice(0, 3).map((complaint: any) => ({
          id: complaint._id || complaint.id,
          token: complaint.token,
          type: complaint.type,
          status: complaint.status,
          createdAt: complaint.createdAt,
          points: complaint.points || 0,
        })) || [];
        setRecentComplaints(transformedComplaints);

        // Load recent announcements
        const announcementsResponse = await announcementsAPI.getAll({ limit: 3 });
        const transformedAnnouncements = announcementsResponse.data?.slice(0, 3).map((announcement: any) => ({
          id: announcement._id || announcement.id,
          title: announcement.title,
          description: announcement.description,
          createdAt: announcement.createdAt,
        })) || [];
        setAnnouncements(transformedAnnouncements);

      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        setRecentComplaints([
      {
        id: "1",
        token: "BRTS001",
        type: "Bus Delay",
        status: "under_review",
        createdAt: "2024-01-15T10:30:00Z",
        points: 10,
      },
      {
        id: "2",
        token: "BRTS002",
        type: "Cleanliness Issue",
        status: "approved",
        createdAt: "2024-01-14T14:20:00Z",
        points: 50,
      },
      {
        id: "3",
        token: "BRTS003",
        type: "Ticketless Travel",
        status: "pending",
        createdAt: "2024-01-13T09:15:00Z",
        points: 0,
      },
    ]);

    setAnnouncements([
      {
        id: "1",
        title: "New Route Addition",
        description:
          "Route 12 from Adajan to Udhna will be operational from January 20th",
        createdAt: "2024-01-15T08:00:00Z",
      },
      {
        id: "2",
        title: "Maintenance Schedule",
        description:
          "Regular maintenance on Route 5 this Sunday from 6 AM to 10 AM",
        createdAt: "2024-01-14T16:30:00Z",
      },
        ]);

        // Mock user statistics for charts (fallback)
        setUserStats({
          monthlyPoints: [
            { name: "Jan", points: 120 },
            { name: "Feb", points: 250 },
            { name: "Mar", points: 180 },
            { name: "Apr", points: 320 },
            { name: "May", points: 290 },
            { name: "Jun", points: 410 },
          ],
          complaintsByStatus: [
            { name: "Approved", value: 15, fill: "#10b981" },
            { name: "Pending", value: 3, fill: "#f59e0b" },
            { name: "Under Review", value: 2, fill: "#3b82f6" },
          ],
          complaintsByType: [
            { name: "Bus Delay", count: 8 },
            { name: "Cleanliness", count: 6 },
            { name: "Overcrowding", count: 4 },
            { name: "Route Issues", count: 2 },
          ],
        });
      }
    };

    loadDashboardData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
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

  if (!user) return null;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your BRTS complaints
          </p>
        </div>
        {isFeatureEnabled("enableRewards") && (
          <Card className="w-full lg:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{user.points}</p>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Profile Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Profile Completion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {Math.floor(user.progress)}% Complete
              </span>
              <Button variant="outline" size="sm" asChild>
                <Link to={APP_ROUTES.PROFILE}>Complete Profile</Link>
              </Button>
            </div>
            <Progress value={user.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Complete your profile to earn bonus points and unlock features
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {availableQuickActions.map((action) => (
            <Card
              key={action.title}
              className="group hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <Link to={action.href}>
                <CardContent className="p-6 text-center">
                  <div
                    className={`h-12 w-12 mx-auto rounded-lg ${action.color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}
                  >
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      {isFeatureEnabled("enableRewards") && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Points Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Points Earned (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <LineChart
                  data={userStats.monthlyPoints}
                  width={"100%"}
                  height={250}
                  dataKeys={[
                    { key: "points", color: "#3b82f6", name: "Points" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Complaint Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                My Complaints Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <PieChart
                  data={userStats.complaintsByStatus}
                  width={"100%"}
                  height={250}
                  showTooltip={true}
                  showLegend={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Complaint Types Analysis */}
      {userStats.complaintsByType.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              My Complaint Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <BarChart
                data={userStats.complaintsByType}
                width={"100%"}
                height={250}
                dataKeys={[
                  { key: "count", color: "#10b981", name: "Complaints" },
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Complaints */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Complaints
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to={APP_ROUTES.COMPLAINT_HISTORY}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint: any) => (
                <div
                  key={complaint.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(complaint.status)}
                    <div>
                      <p className="font-medium text-sm">{complaint.type}</p>
                      <p className="text-xs text-muted-foreground">
                        Token: {complaint.token}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="secondary"
                      className={getStatusColor(complaint.status)}
                    >
                      {complaint.status.replace("_", " ")}
                    </Badge>
                    {complaint.points > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        +{complaint.points} points
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No complaints yet</p>
                <Button className="mt-4" asChild>
                  <Link to={APP_ROUTES.CREATE_COMPLAINT}>
                    Report First Issue
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Latest Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Latest News
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to={APP_ROUTES.ANNOUNCEMENTS}>View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {announcements.length > 0 ? (
              announcements.map((announcement: any) => (
                <div
                  key={announcement.id}
                  className="p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h4 className="font-medium text-sm mb-1">
                    {announcement.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mb-2">
                    {announcement.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No announcements</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Tour */}
      <QuickTour isOpen={showTour} onClose={closeTour} userType="user" />
    </div>
  );
}
