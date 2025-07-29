import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageSquare,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  User,
  FileText,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConfig } from "@/lib/services/config";
import { useToast } from "@/hooks/use-toast";
import { complaintsAPI } from "@/lib/services/api";

const approvalSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  points: z.number().min(0, "Points must be positive").optional(),
});

type ApprovalForm = z.infer<typeof approvalSchema>;

interface Complaint {
  id: string;
  token: string;
  type: string;
  description: string;
  stop: string;
  dateTime: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  evidence: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  priority: "low" | "medium" | "high";
  submittedBy: {
    id: string;
    name: string;
    mobile: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    action: string;
    status: string;
    reason?: string;
    description?: string;
    adminId: string;
    adminName: string;
    timestamp: string;
  }>;
  points?: number;
  canApprove: boolean; // Based on hierarchy
}

const mockComplaints: Complaint[] = [
  {
    id: "1",
    token: "BRTS001",
    type: "Bus Delay",
    description:
      "Bus number 405 was 30 minutes late at Adajan station during peak hours. This caused significant inconvenience to passengers.",
    stop: "Adajan",
    dateTime: "2024-01-15T08:30:00Z",
    evidence: ["evidence1.jpg", "evidence2.jpg"],
    status: "pending",
    priority: "high",
    submittedBy: {
      id: "user1",
      name: "Rajesh Kumar",
      mobile: "9876543210",
    },
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        adminId: "system",
        adminName: "System",
        timestamp: "2024-01-15T10:30:00Z",
      },
    ],
    canApprove: true,
  },
  {
    id: "2",
    token: "BRTS002",
    type: "Cleanliness Issue",
    description:
      "Seats on bus route 12 were dirty with food stains. Floor was also not cleaned properly.",
    stop: "Varachha Road",
    dateTime: "2024-01-14T16:45:00Z",
    evidence: ["evidence3.jpg"],
    status: "under_review",
    priority: "medium",
    submittedBy: {
      id: "user2",
      name: "Priya Sharma",
      mobile: "9876543211",
    },
    assignedTo: {
      id: "admin2",
      name: "Cleaning Supervisor",
      role: "sub_admin",
    },
    createdAt: "2024-01-14T17:30:00Z",
    updatedAt: "2024-01-14T18:00:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        adminId: "system",
        adminName: "System",
        timestamp: "2024-01-14T17:30:00Z",
      },
      {
        action: "Under Review",
        status: "under_review",
        description: "Forwarded to cleaning department for verification.",
        adminId: "admin1",
        adminName: "Support Team",
        timestamp: "2024-01-14T18:00:00Z",
      },
    ],
    canApprove: true,
  },
  {
    id: "3",
    token: "BRTS003",
    type: "Ticketless Travel",
    description:
      "Multiple passengers traveling without tickets on route 8. Conductor did not take action.",
    stop: "Udhna",
    dateTime: "2024-01-13T12:15:00Z",
    evidence: [],
    status: "approved",
    priority: "high",
    submittedBy: {
      id: "user3",
      name: "Amit Patel",
      mobile: "9876543212",
    },
    points: 50,
    createdAt: "2024-01-13T12:45:00Z",
    updatedAt: "2024-01-13T16:30:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        adminId: "system",
        adminName: "System",
        timestamp: "2024-01-13T12:45:00Z",
      },
      {
        action: "Under Review",
        status: "under_review",
        description: "Investigating the reported incident.",
        adminId: "admin3",
        adminName: "Investigation Team",
        timestamp: "2024-01-13T13:00:00Z",
      },
      {
        action: "Approved",
        status: "approved",
        description: "Complaint verified and resolved. Points awarded.",
        adminId: "admin1",
        adminName: "Senior Admin",
        timestamp: "2024-01-13T16:30:00Z",
      },
    ],
    canApprove: false,
  },
];

export default function AdminComplaints() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const { getApprovalHierarchy } = useConfig();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null,
  );
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);

  const form = useForm<ApprovalForm>({
    resolver: zodResolver(approvalSchema),
    defaultValues: {
      status: "approved",
      reason: "",
      description: "",
      points: 50,
    },
  });

  // Check if current admin can approve based on hierarchy
  const canAdminApprove = (complaint: Complaint): boolean => {
    if (!admin?.role) return false;

    const hierarchy = getApprovalHierarchy("complaint");
    const currentAdminIndex = hierarchy.indexOf(admin.role);

    // Super admin can always approve
    if (admin.role === "super_admin") return true;

    // Admin can't approve if not in hierarchy
    if (currentAdminIndex === -1) return false;

    // Check if any higher level admin has already approved/rejected
    const hasHigherApproval = complaint.timeline?.some((event) => {
      if (event.action === "Approved" || event.action === "Rejected") {
        const eventAdminRole = event.adminId; // In real app, you'd look up admin role by ID
        const eventAdminIndex = hierarchy.indexOf(eventAdminRole || "");
        return eventAdminIndex > currentAdminIndex;
      }
      return false;
    });

    // Can approve if no higher level has acted and it's pending/under_review
    return (
      !hasHigherApproval &&
      (complaint.status === "pending" || complaint.status === "under_review")
    );
  };

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      try {
        const response = await complaintsAPI.getAll();
        // Transform API response to match our interface
        const transformedComplaints = response.data.map((complaint: any) => ({
          ...complaint,
          submittedBy: complaint.user || complaint.submittedBy,
          canApprove: canAdminApprove(complaint),
        }));
        setComplaints(transformedComplaints);
      } catch (error) {
        // Silently fall back to mock data in development
        console.warn("API not available, using mock data:", error);
        setComplaints(mockComplaints);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
  }, [admin, toast]);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.submittedBy.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || complaint.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleApproval = async (data: ApprovalForm) => {
    if (!selectedComplaint) return;

    try {
      // Call real API to approve/reject complaint
      const approvalData = {
        status: data.status,
        reason: data.reason,
        description: data.description,
        points: data.status === "approved" ? data.points : undefined,
      };

      const response = await complaintsAPI.approve(
        selectedComplaint.id,
        approvalData,
      );

      // Update local state with API response
      const updatedComplaint = {
        ...selectedComplaint,
        ...response.data,
        timeline: [
          ...selectedComplaint.timeline,
          {
            action: data.status === "approved" ? "Approved" : "Rejected",
            status: data.status,
            reason: data.reason,
            description: data.description,
            adminId: admin?.id || "admin1",
            adminName: admin?.name || "Admin",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setComplaints((prev) =>
        prev.map((c) => (c.id === selectedComplaint.id ? updatedComplaint : c)),
      );

      toast({
        title: `Complaint ${data.status === "approved" ? "Approved" : "Rejected"}`,
        description: `Complaint ${selectedComplaint.token} has been ${data.status}.`,
      });

      setApprovalDialogOpen(false);
      setSelectedComplaint(null);
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to process complaint. Please try again.",
        variant: "destructive",
      });
    }
  };

  const refreshComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.getAll();
      const transformedComplaints = response.data.map((complaint: any) => ({
        ...complaint,
        submittedBy: complaint.user || complaint.submittedBy,
        canApprove: canAdminApprove(complaint),
      }));
      setComplaints(transformedComplaints);
      toast({
        title: "Refreshed",
        description: "Complaints list has been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh complaints.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openApprovalDialog = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setApprovalDialogOpen(true);
    form.reset({
      status: "approved",
      reason: "",
      description: "",
      points: 50,
    });
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
              <MessageSquare className="h-8 w-8 text-primary" />
              Complaints Management
            </h1>
            <p className="text-muted-foreground">
              Review and manage all complaint submissions
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={refreshComplaints}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">
                {complaints.filter((c) => c.status === "pending").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-sm text-muted-foreground">Under Review</p>
              <p className="text-2xl font-bold">
                {complaints.filter((c) => c.status === "under_review").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">
                {complaints.filter((c) => c.status === "approved").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">
                {complaints.filter((c) => c.status === "rejected").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search complaints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle>Complaints ({filteredComplaints.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>
                        <div className="font-mono font-medium">
                          {complaint.token}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{complaint.type}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {complaint.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">
                              {complaint.submittedBy.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {complaint.submittedBy.mobile}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(complaint.priority)}>
                          {complaint.priority.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(complaint.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(complaint.status)}
                            {complaint.status.replace("_", " ").toUpperCase()}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {new Date(complaint.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Complaint Details - {complaint.token}
                                </DialogTitle>
                              </DialogHeader>
                              <ScrollArea className="max-h-[80vh]">
                                <div className="space-y-6 pr-4">
                                  {/* Complaint Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Basic Information
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">
                                            Type:
                                          </span>{" "}
                                          {complaint.type}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Location:
                                          </span>{" "}
                                          {complaint.stop}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Date/Time:
                                          </span>{" "}
                                          {new Date(
                                            complaint.dateTime,
                                          ).toLocaleString()}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Priority:
                                          </span>{" "}
                                          <Badge
                                            className={getPriorityColor(
                                              complaint.priority,
                                            )}
                                          >
                                            {complaint.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Status
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <span className="font-medium">
                                            Current Status:
                                          </span>{" "}
                                          <Badge
                                            className={getStatusColor(
                                              complaint.status,
                                            )}
                                          >
                                            {complaint.status.replace("_", " ")}
                                          </Badge>
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Submitted:
                                          </span>{" "}
                                          {new Date(
                                            complaint.createdAt,
                                          ).toLocaleString()}
                                        </div>
                                        <div>
                                          <span className="font-medium">
                                            Last Updated:
                                          </span>{" "}
                                          {new Date(
                                            complaint.updatedAt,
                                          ).toLocaleString()}
                                        </div>
                                        {complaint.points && (
                                          <div>
                                            <span className="font-medium">
                                              Points Awarded:
                                            </span>{" "}
                                            {complaint.points}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Description */}
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Description
                                    </h4>
                                    <p className="text-sm bg-muted p-3 rounded">
                                      {complaint.description}
                                    </p>
                                  </div>

                                  {/* Evidence */}
                                  {complaint.evidence.length > 0 && (
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Evidence
                                      </h4>
                                      <div className="grid grid-cols-3 gap-2">
                                        {complaint.evidence.map(
                                          (file, index) => (
                                            <div
                                              key={index}
                                              className="p-2 border rounded text-sm text-center"
                                            >
                                              <FileText className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                                              {file}
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Timeline */}
                                  <div>
                                    <h4 className="font-medium mb-3">
                                      Timeline
                                    </h4>
                                    <div className="space-y-3">
                                      {complaint.timeline.map((item, index) => (
                                        <div key={index} className="flex gap-3">
                                          <div className="flex flex-col items-center">
                                            {getStatusIcon(item.status)}
                                            {index <
                                              complaint.timeline.length - 1 && (
                                              <div className="h-6 w-px bg-border mt-1" />
                                            )}
                                          </div>
                                          <div className="flex-1 pb-3">
                                            <div className="flex items-center justify-between mb-1">
                                              <h5 className="font-medium text-sm">
                                                {item.action}
                                              </h5>
                                              <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                  item.timestamp,
                                                ).toLocaleString()}
                                              </p>
                                            </div>
                                            {item.description && (
                                              <p className="text-sm text-muted-foreground mb-1">
                                                {item.description}
                                              </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                              by {item.adminName}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                          {(complaint.status === "pending" ||
                            complaint.status === "under_review") && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canAdminApprove(complaint)}
                              onClick={() => openApprovalDialog(complaint)}
                              title={
                                !canAdminApprove(complaint)
                                  ? "You don't have permission to approve this complaint at this level"
                                  : "Review and approve/reject complaint"
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {canAdminApprove(complaint)
                                ? "Review"
                                : "Pending Approval"}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Review Complaint - {selectedComplaint?.token}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleApproval)}
                className="space-y-6"
              >
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Complaint Summary</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedComplaint?.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Decision *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="approved">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                Approve
                              </div>
                            </SelectItem>
                            <SelectItem value="rejected">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-500" />
                                Reject
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("status") === "approved" && (
                    <FormField
                      control={form.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points to Award</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {form.watch("status") === "rejected" && (
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason for Rejection</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Brief reason for rejection"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Notes *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Detailed explanation of the decision..."
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1">
                    {form.watch("status") === "approved" ? "Approve" : "Reject"}{" "}
                    Complaint
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setApprovalDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
