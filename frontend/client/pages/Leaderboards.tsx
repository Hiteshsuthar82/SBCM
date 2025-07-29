import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Trophy,
  Medal,
  Award,
  Crown,
  Star,
  TrendingUp,
  Users,
  Calendar,
  Target,
  RefreshCw,
  Zap,
  Flame,
  Gem,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { leaderboardAPI } from "@/lib/services/api";

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  complaintsCount: number;
  resolvedCount: number;
  rank: number;
  badge: string;
  achievementLevel: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  streak: number;
  joinedDate: string;
  isCurrentUser?: boolean;
}

const mockLeaderboardData: LeaderboardUser[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    points: 2850,
    complaintsCount: 47,
    resolvedCount: 42,
    rank: 1,
    badge: "Super Contributor",
    achievementLevel: "diamond",
    streak: 15,
    joinedDate: "2023-08-15",
  },
  {
    id: "2",
    name: "Priya Sharma",
    points: 2340,
    complaintsCount: 38,
    resolvedCount: 35,
    rank: 2,
    badge: "Quality Reporter",
    achievementLevel: "platinum",
    streak: 12,
    joinedDate: "2023-09-02",
  },
  {
    id: "3",
    name: "Amit Patel",
    points: 1920,
    complaintsCount: 32,
    resolvedCount: 28,
    rank: 3,
    badge: "Detail Master",
    achievementLevel: "gold",
    streak: 8,
    joinedDate: "2023-10-01",
  },
  {
    id: "4",
    name: "Sneha Joshi",
    points: 1650,
    complaintsCount: 28,
    resolvedCount: 24,
    rank: 4,
    badge: "Helpful Citizen",
    achievementLevel: "gold",
    streak: 6,
    joinedDate: "2023-11-10",
  },
  {
    id: "5",
    name: "Vikram Singh",
    points: 1420,
    complaintsCount: 24,
    resolvedCount: 21,
    rank: 5,
    badge: "Rising Star",
    achievementLevel: "silver",
    streak: 4,
    joinedDate: "2023-12-05",
  },
  {
    id: "user123", // Current user from mock auth
    name: "John Doe",
    points: 150,
    complaintsCount: 3,
    resolvedCount: 2,
    rank: 47,
    badge: "Newcomer",
    achievementLevel: "bronze",
    streak: 1,
    joinedDate: "2024-01-15",
    isCurrentUser: true,
  },
];

// Continue with more users for demonstration
for (let i = 6; i <= 50; i++) {
  if (i === 47) continue; // Skip rank 47 since it's the current user
  mockLeaderboardData.push({
    id: `user${i}`,
    name: `User ${i}`,
    points: Math.max(50, 1400 - (i - 5) * 50 + Math.random() * 100),
    complaintsCount: Math.max(1, 25 - i + Math.floor(Math.random() * 10)),
    resolvedCount: Math.max(0, 20 - i + Math.floor(Math.random() * 8)),
    rank: i <= 46 ? i : i + 1,
    badge:
      i <= 10 ? "Top Performer" : i <= 20 ? "Active Member" : "Contributor",
    achievementLevel: i <= 10 ? "gold" : i <= 25 ? "silver" : "bronze",
    streak: Math.max(0, Math.floor(Math.random() * 10)),
    joinedDate: `2023-${String(Math.floor(Math.random() * 12) + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, "0")}`,
  });
}

const achievementColors = {
  bronze: "text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-300",
  silver: "text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300",
  gold: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  platinum:
    "text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-300",
  diamond: "text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300",
};

const achievementIcons = {
  bronze: Medal,
  silver: Award,
  gold: Trophy,
  platinum: Crown,
  diamond: Gem,
};

export default function Leaderboards() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [timeFrame, setTimeFrame] = useState("all");
  const [category, setCategory] = useState("points");

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await leaderboardAPI.get({ timeFrame, category });
        // Transform API response to match our interface
        const transformedData = response.data?.map((user: any, index: number) => ({
          id: user._id || user.id,
          name: user.name,
          avatar: user.avatar,
          points: user.points || 0,
          complaintsCount: user.complaintsCount || 0,
          resolvedCount: user.resolvedCount || 0,
          rank: index + 1,
          badge: user.badge || getBadgeForRank(index + 1),
          streak: user.streak || 0,
          level: user.level || 1,
          progress: user.progress || 0,
        })) || [];
        setLeaderboardData(transformedData);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data and sort based on selected category
      const sortedData = [...mockLeaderboardData]
        .sort((a, b) => {
          switch (category) {
            case "complaints":
              return b.complaintsCount - a.complaintsCount;
            case "resolved":
              return b.resolvedCount - a.resolvedCount;
            case "streak":
              return b.streak - a.streak;
            default:
              return b.points - a.points;
          }
        })
        .map((user, index) => ({ ...user, rank: index + 1 }));

        setLeaderboardData(sortedData);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [timeFrame, category]);

  const currentUserData = leaderboardData.find((u) => u.isCurrentUser);
  const topUsers = leaderboardData.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  const getValueByCategory = (user: LeaderboardUser) => {
    switch (category) {
      case "complaints":
        return user.complaintsCount;
      case "resolved":
        return user.resolvedCount;
      case "streak":
        return user.streak;
      default:
        return user.points;
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case "complaints":
        return "Complaints";
      case "resolved":
        return "Resolved";
      case "streak":
        return "Day Streak";
      default:
        return "Points";
    }
  };

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

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboards
          </h1>
          <p className="text-muted-foreground">
            Top contributors making Surat BRTS better for everyone
          </p>
        </div>

        {/* Current User Stats */}
        {currentUserData && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                  <AvatarImage src={currentUserData.avatar} />
                  <AvatarFallback className="text-lg font-bold">
                    {currentUserData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold">
                      {currentUserData.name}
                    </h3>
                    <Badge variant="secondary">You</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Rank</p>
                      <p className="font-bold text-lg">
                        #{currentUserData.rank}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Points</p>
                      <p className="font-bold text-lg">
                        {currentUserData.points}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Complaints</p>
                      <p className="font-bold text-lg">
                        {currentUserData.complaintsCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Streak</p>
                      <p className="font-bold text-lg flex items-center gap-1">
                        <Flame className="h-4 w-4 text-orange-500" />
                        {currentUserData.streak}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Badge
                    className={
                      achievementColors[currentUserData.achievementLevel]
                    }
                  >
                    {currentUserData.achievementLevel.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {currentUserData.badge}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex gap-4 flex-1">
                <Select value={timeFrame} onValueChange={setTimeFrame}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Points</SelectItem>
                    <SelectItem value="complaints">Complaints</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top 3 Podium */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topUsers.slice(0, 3).map((user, index) => {
                  const AchievementIcon =
                    achievementIcons[user.achievementLevel];
                  return (
                    <Card
                      key={user.id}
                      className={`text-center relative overflow-hidden ${
                        index === 0
                          ? "ring-2 ring-yellow-500/20 bg-gradient-to-b from-yellow-50 to-background dark:from-yellow-950/20"
                          : index === 1
                            ? "ring-2 ring-gray-500/20 bg-gradient-to-b from-gray-50 to-background dark:from-gray-950/20"
                            : "ring-2 ring-amber-500/20 bg-gradient-to-b from-amber-50 to-background dark:from-amber-950/20"
                      }`}
                    >
                      <CardContent className="p-6">
                        <div className="absolute top-2 right-2">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary/20">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xl font-bold">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold text-lg mb-2">{user.name}</h3>
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <AchievementIcon className="h-4 w-4" />
                          <Badge
                            className={achievementColors[user.achievementLevel]}
                          >
                            {user.achievementLevel}
                          </Badge>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {getCategoryLabel()}:
                            </span>
                            <span className="font-bold">
                              {getValueByCategory(user)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Resolved:
                            </span>
                            <span className="font-bold">
                              {user.resolvedCount}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Streak:
                            </span>
                            <span className="font-bold flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {user.streak}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Full Leaderboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Full Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[600px] overflow-y-auto">
                {leaderboardData.map((user, index) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 p-4 border-b hover:bg-accent/50 transition-colors ${
                      user.isCurrentUser ? "bg-primary/5 border-primary/20" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(user.rank)}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{user.name}</p>
                        {user.isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {user.badge}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{getValueByCategory(user)}</p>
                      <p className="text-xs text-muted-foreground">
                        {getCategoryLabel()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements & Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Community Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Users
                  </span>
                  <span className="font-bold">{leaderboardData.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Points
                  </span>
                  <span className="font-bold">
                    {leaderboardData
                      .reduce((sum, user) => sum + user.points, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Complaints
                  </span>
                  <span className="font-bold">
                    {leaderboardData.reduce(
                      (sum, user) => sum + user.complaintsCount,
                      0,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Resolution Rate
                  </span>
                  <span className="font-bold text-green-600">
                    {Math.round(
                      (leaderboardData.reduce(
                        (sum, user) => sum + user.resolvedCount,
                        0,
                      ) /
                        leaderboardData.reduce(
                          (sum, user) => sum + user.complaintsCount,
                          0,
                        )) *
                        100,
                    )}
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Achievement Levels</h4>
                {Object.entries(achievementColors).map(
                  ([level, colorClass]) => {
                    const count = leaderboardData.filter(
                      (u) => u.achievementLevel === level,
                    ).length;
                    const percentage = (count / leaderboardData.length) * 100;
                    const Icon =
                      achievementIcons[level as keyof typeof achievementIcons];

                    return (
                      <div key={level} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span className="capitalize">{level}</span>
                          </div>
                          <span className="font-medium">{count}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
