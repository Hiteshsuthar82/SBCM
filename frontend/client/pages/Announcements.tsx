import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/hooks/useAuth";
import Layout from "@/components/layout/Layout";
import { announcementsAPI } from "@/lib/services/api";
import {
  Heart,
  HeartOff,
  Search,
  Calendar,
  Megaphone,
  Filter,
  RefreshCw,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  description: string;
  image?: string;
  route?: string;
  scheduledAt?: string;
  likes: number;
  dislikes: number;
  userLiked?: boolean;
  userDisliked?: boolean;
  createdAt: string;
}

export default function Announcements() {
  const { isAuthenticated } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "scheduled">("all");

  useEffect(() => {
    const loadAnnouncements = async () => {
      setLoading(true);
      try {
        const response = await announcementsAPI.getAll();
        // Transform API response to match our interface
        const transformedAnnouncements = response.data?.map((announcement: any) => ({
          id: announcement._id || announcement.id,
          title: announcement.title,
          description: announcement.description,
          image: announcement.image,
          route: announcement.route,
          scheduledAt: announcement.scheduledAt,
          likes: announcement.likes || 0,
          dislikes: announcement.dislikes || 0,
          userLiked: announcement.userLiked || false,
          userDisliked: announcement.userDisliked || false,
          createdAt: announcement.createdAt,
        })) || [];
        setAnnouncements(transformedAnnouncements);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockAnnouncements: Announcement[] = [
        {
          id: "1",
          title: "New Route 15 Launch",
          description:
            "We're excited to announce the launch of Route 15 connecting Adajan to Varachha Road. This new route will provide better connectivity for residents and reduce travel time by 20 minutes.",
          image: "/placeholder.svg",
          route: "Route 15",
          likes: 234,
          dislikes: 12,
          userLiked: false,
          userDisliked: false,
          createdAt: "2024-01-15T10:00:00Z",
        },
        {
          id: "2",
          title: "Weekend Maintenance Schedule",
          description:
            "Please note that Route 8 will undergo scheduled maintenance this Saturday from 6:00 AM to 10:00 AM. Alternative routes are available via Routes 3 and 12.",
          route: "Route 8",
          scheduledAt: "2024-01-20T06:00:00Z",
          likes: 89,
          dislikes: 5,
          userLiked: true,
          userDisliked: false,
          createdAt: "2024-01-14T15:30:00Z",
        },
        {
          id: "3",
          title: "Digital Payment Integration",
          description:
            "Starting next month, all BRTS buses will support digital payments including UPI, credit/debit cards, and mobile wallets. No more cash-only transactions!",
          likes: 512,
          dislikes: 23,
          userLiked: false,
          userDisliked: false,
          createdAt: "2024-01-13T09:15:00Z",
        },
        {
          id: "4",
          title: "Safety Guidelines Update",
          description:
            "Updated safety guidelines are now in effect. Please maintain social distancing, wear masks, and follow the new boarding procedures for everyone's safety.",
          likes: 156,
          dislikes: 8,
          userLiked: false,
          userDisliked: false,
          createdAt: "2024-01-12T14:20:00Z",
        },
      ];

        setAnnouncements(mockAnnouncements);
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const handleLike = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await announcementsAPI.like(id);
      
      setAnnouncements((prev) =>
        prev.map((announcement) => {
          if (announcement.id === id) {
            const wasLiked = announcement.userLiked;
            const wasDisliked = announcement.userDisliked;

            return {
              ...announcement,
              userLiked: !wasLiked,
              userDisliked: false,
              likes: wasLiked
                ? announcement.likes - 1
                : announcement.likes + 1 + (wasDisliked ? 1 : 0),
              dislikes: wasDisliked
                ? announcement.dislikes - 1
                : announcement.dislikes,
            };
          }
          return announcement;
        }),
      );
    } catch (error) {
      console.error("Failed to like announcement:", error);
    }
  };

  const handleDislike = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      await announcementsAPI.dislike(id);
      
      setAnnouncements((prev) =>
        prev.map((announcement) => {
          if (announcement.id === id) {
            const wasLiked = announcement.userLiked;
            const wasDisliked = announcement.userDisliked;

            return {
              ...announcement,
              userLiked: false,
              userDisliked: !wasDisliked,
              likes: wasLiked ? announcement.likes - 1 : announcement.likes,
              dislikes: wasDisliked
                ? announcement.dislikes - 1
                : announcement.dislikes + 1 + (wasLiked ? 1 : 0),
            };
          }
          return announcement;
        }),
      );
    } catch (error) {
      console.error("Failed to dislike announcement:", error);
    }
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = (() => {
      switch (filter) {
        case "recent":
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          return new Date(announcement.createdAt) > threeDaysAgo;
        case "scheduled":
          return !!announcement.scheduledAt;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Megaphone className="h-8 w-8 text-primary" />
            Latest Announcements
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest news and updates from Surat BRTS
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("recent")}
            >
              Recent
            </Button>
            <Button
              variant={filter === "scheduled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("scheduled")}
            >
              Scheduled
            </Button>
          </div>
        </div>

        {/* Announcements Feed */}
        <div className="space-y-6">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map((announcement) => (
              <Card
                key={announcement.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">
                        {announcement.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(
                            announcement.createdAt,
                          ).toLocaleDateString()}
                        </div>
                        {announcement.route && (
                          <Badge variant="secondary">
                            {announcement.route}
                          </Badge>
                        )}
                        {announcement.scheduledAt && (
                          <Badge variant="outline">
                            Scheduled:{" "}
                            {new Date(
                              announcement.scheduledAt,
                            ).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {announcement.image && (
                    <img
                      src={announcement.image}
                      alt={announcement.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}

                  <p className="text-foreground leading-relaxed">
                    {announcement.description}
                  </p>

                  {/* Like/Dislike Actions */}
                  {isAuthenticated && (
                    <div className="flex items-center gap-4 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(announcement.id)}
                        className={
                          announcement.userLiked
                            ? "text-red-500 hover:text-red-600"
                            : ""
                        }
                      >
                        <Heart
                          className={`h-4 w-4 mr-1 ${
                            announcement.userLiked ? "fill-current" : ""
                          }`}
                        />
                        {announcement.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDislike(announcement.id)}
                        className={
                          announcement.userDisliked
                            ? "text-gray-500 hover:text-gray-600"
                            : ""
                        }
                      >
                        <HeartOff
                          className={`h-4 w-4 mr-1 ${
                            announcement.userDisliked ? "fill-current" : ""
                          }`}
                        />
                        {announcement.dislikes}
                      </Button>
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="flex items-center gap-4 pt-2 border-t text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {announcement.likes} likes
                      </span>
                      <span className="flex items-center gap-1">
                        <HeartOff className="h-4 w-4" />
                        {announcement.dislikes} dislikes
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No announcements</h3>
              <p className="text-muted-foreground">
                {searchTerm || filter !== "all"
                  ? "No announcements match your criteria"
                  : "Check back later for updates"}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
