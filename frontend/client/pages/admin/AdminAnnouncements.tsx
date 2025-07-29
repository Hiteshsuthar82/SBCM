import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Layout from "@/components/layout/Layout";
import { Announcement } from "@/lib/types";
import { announcementsAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Calendar,
  Megaphone,
  Edit2,
  Trash2,
  Eye,
  Heart,
  HeartOff,
  Upload,
  Clock,
  Send,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";

interface AnnouncementForm {
  title: string;
  description: string;
  image?: File | string;
  route?: string;
  isScheduled: boolean;
  scheduledAt?: string;
}

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<
    "all" | "recent" | "scheduled" | "published"
  >("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [viewingAnnouncement, setViewingAnnouncement] =
    useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementForm>({
    title: "",
    description: "",
    isScheduled: false,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

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
          createdAt: announcement.createdAt,
          updatedAt: announcement.updatedAt,
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
          createdAt: "2024-01-14T15:30:00Z",
        },
        {
          id: "3",
          title: "Digital Payment Integration",
          description:
            "Starting next month, all BRTS buses will support digital payments including UPI, credit/debit cards, and mobile wallets. No more cash-only transactions!",
          likes: 512,
          dislikes: 23,
          createdAt: "2024-01-13T09:15:00Z",
        },
        {
          id: "4",
          title: "Safety Guidelines Update",
          description:
            "Updated safety guidelines are now in effect. Please maintain social distancing, wear masks, and follow the new boarding procedures for everyone's safety.",
          likes: 156,
          dislikes: 8,
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setForm({ ...form, image: file });
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      isScheduled: false,
    });
    setImagePreview("");
    setEditingAnnouncement(null);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.route && form.route !== "none") {
        formData.append('route', form.route);
      }
      if (form.isScheduled && form.scheduledAt) {
        formData.append('scheduledAt', form.scheduledAt);
      }
      if (form.image instanceof File) {
        formData.append('image', form.image);
      }

      if (editingAnnouncement) {
        // Note: Update API might need different implementation
        // For now, we'll use the create API pattern
        const response = await announcementsAPI.create(formData);
        const updatedAnnouncement: Announcement = {
          id: editingAnnouncement.id,
          title: form.title,
          description: form.description,
          image: response.data?.image || form.image,
          route: form.route === "none" ? undefined : form.route,
          scheduledAt: form.isScheduled ? form.scheduledAt : undefined,
          likes: editingAnnouncement.likes,
          dislikes: editingAnnouncement.dislikes,
          createdAt: editingAnnouncement.createdAt,
        };
        
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === editingAnnouncement.id ? updatedAnnouncement : a,
          ),
        );
        
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        });
      } else {
        // Create new announcement
        const response = await announcementsAPI.create(formData);
        const newAnnouncement: Announcement = {
          id: response.data._id || response.data.id,
          title: form.title,
          description: form.description,
          image: response.data?.image || "/placeholder.svg",
          route: form.route === "none" ? undefined : form.route,
          scheduledAt: form.isScheduled ? form.scheduledAt : undefined,
          likes: 0,
          dislikes: 0,
          createdAt: new Date().toISOString(),
        };
        
        setAnnouncements((prev) => [newAnnouncement, ...prev]);
        
        toast({
          title: "Success",
          description: "Announcement created successfully",
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      description: announcement.description,
      image: announcement.image,
      route: announcement.route || "none",
      isScheduled: !!announcement.scheduledAt,
      scheduledAt: announcement.scheduledAt,
    });
    if (announcement.image) {
      setImagePreview(announcement.image);
    }
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
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
          return (
            !!announcement.scheduledAt &&
            new Date(announcement.scheduledAt) > new Date()
          );
        case "published":
          return (
            !announcement.scheduledAt ||
            new Date(announcement.scheduledAt) <= new Date()
          );
        default:
          return true;
      }
    })();

    return matchesSearch && matchesFilter;
  });

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Megaphone className="h-8 w-8 text-primary" />
              Manage Announcements
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage announcements for the Surat BRTS system
            </p>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              setIsCreateDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingAnnouncement
                    ? "Edit Announcement"
                    : "Create New Announcement"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Enter announcement title..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter announcement description..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="route">Route (Optional)</Label>
                  <Select
                    value={form.route || "none"}
                    onValueChange={(value) =>
                      setForm({
                        ...form,
                        route: value === "none" ? undefined : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific route</SelectItem>
                      <SelectItem value="Route 1">Route 1</SelectItem>
                      <SelectItem value="Route 2">Route 2</SelectItem>
                      <SelectItem value="Route 3">Route 3</SelectItem>
                      <SelectItem value="Route 8">Route 8</SelectItem>
                      <SelectItem value="Route 15">Route 15</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Image (Optional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="scheduled"
                      checked={form.isScheduled}
                      onCheckedChange={(checked) =>
                        setForm({ ...form, isScheduled: checked as boolean })
                      }
                    />
                    <Label htmlFor="scheduled">Schedule for later</Label>
                  </div>

                  {form.isScheduled && (
                    <div className="space-y-2">
                      <Label htmlFor="scheduledAt">Scheduled Date & Time</Label>
                      <Input
                        id="scheduledAt"
                        type="datetime-local"
                        value={form.scheduledAt || ""}
                        onChange={(e) =>
                          setForm({ ...form, scheduledAt: e.target.value })
                        }
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={!form.title.trim() || !form.description.trim()}
                  >
                    {form.isScheduled ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {editingAnnouncement ? "Update" : "Publish"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
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
              variant={filter === "published" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("published")}
            >
              Published
            </Button>
            <Button
              variant={filter === "scheduled" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("scheduled")}
            >
              Scheduled
            </Button>
            <Button
              variant={filter === "recent" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("recent")}
            >
              Recent
            </Button>
          </div>
        </div>

        {/* Announcements List */}
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
                          <Badge
                            variant={
                              new Date(announcement.scheduledAt) > new Date()
                                ? "outline"
                                : "default"
                            }
                          >
                            {new Date(announcement.scheduledAt) > new Date()
                              ? "Scheduled"
                              : "Published"}
                            :{" "}
                            {new Date(
                              announcement.scheduledAt,
                            ).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewingAnnouncement(announcement)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Preview Announcement</DialogTitle>
                          </DialogHeader>
                          {viewingAnnouncement && (
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-2xl font-bold mb-2">
                                  {viewingAnnouncement.title}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(
                                      viewingAnnouncement.createdAt,
                                    ).toLocaleDateString()}
                                  </div>
                                  {viewingAnnouncement.route && (
                                    <Badge variant="secondary">
                                      {viewingAnnouncement.route}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {viewingAnnouncement.image && (
                                <img
                                  src={viewingAnnouncement.image}
                                  alt={viewingAnnouncement.title}
                                  className="w-full h-48 object-cover rounded-lg"
                                />
                              )}
                              <p className="text-foreground leading-relaxed">
                                {viewingAnnouncement.description}
                              </p>
                              <div className="flex items-center gap-4 pt-2 border-t">
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Heart className="h-4 w-4" />
                                  {viewingAnnouncement.likes} likes
                                </span>
                                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <HeartOff className="h-4 w-4" />
                                  {viewingAnnouncement.dislikes} dislikes
                                </span>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Announcement
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "
                              {announcement.title}"? This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(announcement.id)}
                              className="bg-red-500 hover:bg-red-600"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
                    {announcement.description.length > 200
                      ? `${announcement.description.substring(0, 200)}...`
                      : announcement.description}
                  </p>

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
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-20">
              <Megaphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No announcements found
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filter !== "all"
                  ? "No announcements match your criteria"
                  : "Get started by creating your first announcement"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
