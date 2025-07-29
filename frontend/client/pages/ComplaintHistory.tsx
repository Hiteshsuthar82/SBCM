import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  MapPin,
  FileText,
  Award,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { APP_ROUTES } from "@/lib/constants";
import { complaintsAPI } from "@/lib/services/api";

interface Complaint {
  id: string;
  token: string;
  type: string;
  description: string;
  stop: string;
  dateTime: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  reason?: string;
  adminDescription?: string;
  points: number;
  evidence: string[];
  createdAt: string;
  updatedAt: string;
  timeline: Array<{
    action: string;
    status: string;
    reason?: string;
    description?: string;
    adminName?: string;
    timestamp: string;
  }>;
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
    status: "approved",
    adminDescription:
      "Issue has been resolved. Bus schedule has been adjusted.",
    points: 50,
    evidence: ["image1.jpg", "image2.jpg"],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-16T14:20:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        timestamp: "2024-01-15T10:30:00Z",
      },
      {
        action: "Under Review",
        status: "under_review",
        description: "Assigned to operations team for investigation.",
        adminName: "Admin Team",
        timestamp: "2024-01-15T11:00:00Z",
      },
      {
        action: "Approved",
        status: "approved",
        description: "Issue verified and resolved. Points awarded.",
        adminName: "Operations Manager",
        timestamp: "2024-01-16T14:20:00Z",
      },
    ],
  },
  {
    id: "2",
    token: "BRTS002",
    type: "Cleanliness Issue",
    description:
      "Seats on bus route 12 were dirty with food stains. Floor was also not cleaned properly.",
    stop: "Varachha Road",
    dateTime: "2024-01-14T16:45:00Z",
    status: "under_review",
    points: 0,
    evidence: ["image3.jpg"],
    createdAt: "2024-01-14T17:30:00Z",
    updatedAt: "2024-01-14T18:00:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        timestamp: "2024-01-14T17:30:00Z",
      },
      {
        action: "Under Review",
        status: "under_review",
        description: "Forwarded to cleaning department for verification.",
        adminName: "Support Team",
        timestamp: "2024-01-14T18:00:00Z",
      },
    ],
  },
  {
    id: "3",
    token: "BRTS003",
    type: "Ticketless Travel",
    description:
      "Observed multiple passengers traveling without tickets on route 8. Conductor did not take any action.",
    stop: "Udhna",
    dateTime: "2024-01-13T12:15:00Z",
    status: "rejected",
    reason: "Insufficient evidence provided",
    adminDescription:
      "Unable to verify the claim. Please provide more specific details and evidence for future complaints.",
    points: 0,
    evidence: [],
    createdAt: "2024-01-13T12:45:00Z",
    updatedAt: "2024-01-13T16:30:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        timestamp: "2024-01-13T12:45:00Z",
      },
      {
        action: "Under Review",
        status: "under_review",
        description: "Investigating the reported incident.",
        adminName: "Investigation Team",
        timestamp: "2024-01-13T13:00:00Z",
      },
      {
        action: "Rejected",
        status: "rejected",
        reason: "Insufficient evidence provided",
        description:
          "Unable to verify the claim. Please provide more specific details.",
        adminName: "Senior Admin",
        timestamp: "2024-01-13T16:30:00Z",
      },
    ],
  },
  {
    id: "4",
    token: "BRTS004",
    type: "Staff Behavior",
    description: "Driver was rude to elderly passenger and refused to wait.",
    stop: "Katargam",
    dateTime: "2024-01-12T09:30:00Z",
    status: "pending",
    points: 0,
    evidence: [],
    createdAt: "2024-01-12T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    timeline: [
      {
        action: "Complaint Submitted",
        status: "pending",
        timestamp: "2024-01-12T10:00:00Z",
      },
    ],
  },
];

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const loadComplaints = async () => {
      setLoading(true);
      try {
        const response = await complaintsAPI.getUserComplaints();
        // Transform API response to match our interface
        const transformedComplaints = response.data?.map((complaint: any) => ({
          id: complaint._id || complaint.id,
          token: complaint.token,
          type: complaint.type,
          description: complaint.description,
          stop: complaint.stop || complaint.busStop,
          dateTime: complaint.dateTime || complaint.incidentDateTime,
          status: complaint.status,
          reason: complaint.reason,
          adminDescription: complaint.adminDescription,
          points: complaint.points || 0,
          evidence: complaint.evidence || [],
          createdAt: complaint.createdAt,
          updatedAt: complaint.updatedAt,
          timeline: complaint.timeline || [],
        })) || [];
        setComplaints(transformedComplaints);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        setComplaints(mockComplaints);
      } finally {
        setLoading(false);
      }
    };

    loadComplaints();
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

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.token.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.stop.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || complaint.status === statusFilter;

    const matchesType = typeFilter === "all" || complaint.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const complaintTypes = Array.from(
    new Set(complaints.map((c) => c.type)),
  ).sort();

  const totalPoints = complaints
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.points, 0);

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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Complaint History</h1>
            <p className="text-muted-foreground">
              Track all your submitted complaints and their status
            </p>
          </div>
          <Card className="w-full lg:w-auto">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{complaints.length}</p>
                  <p className="text-xs text-muted-foreground">
                    Total Complaints
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {totalPoints}
                  </p>
                  <p className="text-xs text-muted-foreground">Points Earned</p>
                </div>
              </div>
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
                  placeholder="Search by token, type, description..."
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
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {complaintTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Complaints Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Complaints ({filteredComplaints.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredComplaints.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Points</TableHead>
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
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {complaint.stop}
                          </div>
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
                          {complaint.points > 0 ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Award className="h-3 w-3" />
                              {complaint.points}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
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
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Complaint Details - {complaint.token}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[60vh]">
                                  <div className="space-y-6 pr-4">
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium mb-1">
                                          Type
                                        </h4>
                                        <p className="text-sm">
                                          {complaint.type}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">
                                          Status
                                        </h4>
                                        <Badge
                                          className={getStatusColor(
                                            complaint.status,
                                          )}
                                        >
                                          {complaint.status
                                            .replace("_", " ")
                                            .toUpperCase()}
                                        </Badge>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">
                                          Location
                                        </h4>
                                        <p className="text-sm">
                                          {complaint.stop}
                                        </p>
                                      </div>
                                      <div>
                                        <h4 className="font-medium mb-1">
                                          Date & Time
                                        </h4>
                                        <p className="text-sm">
                                          {new Date(
                                            complaint.dateTime,
                                          ).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                      <h4 className="font-medium mb-2">
                                        Description
                                      </h4>
                                      <p className="text-sm">
                                        {complaint.description}
                                      </p>
                                    </div>

                                    {/* Admin Response */}
                                    {(complaint.adminDescription ||
                                      complaint.reason) && (
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Admin Response
                                        </h4>
                                        {complaint.reason && (
                                          <div className="mb-2">
                                            <span className="text-sm font-medium">
                                              Reason:{" "}
                                            </span>
                                            <span className="text-sm">
                                              {complaint.reason}
                                            </span>
                                          </div>
                                        )}
                                        {complaint.adminDescription && (
                                          <p className="text-sm">
                                            {complaint.adminDescription}
                                          </p>
                                        )}
                                      </div>
                                    )}

                                    {/* Timeline */}
                                    <div>
                                      <h4 className="font-medium mb-3">
                                        Timeline
                                      </h4>
                                      <div className="space-y-3">
                                        {complaint.timeline.map(
                                          (item, index) => (
                                            <div
                                              key={index}
                                              className="flex gap-3"
                                            >
                                              <div className="flex flex-col items-center">
                                                {getStatusIcon(item.status)}
                                                {index <
                                                  complaint.timeline.length -
                                                    1 && (
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
                                                  <p className="text-sm text-muted-foreground">
                                                    {item.description}
                                                  </p>
                                                )}
                                                {item.adminName && (
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    by {item.adminName}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>

                                    {/* Evidence */}
                                    {complaint.evidence.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">
                                          Evidence
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                          {complaint.evidence.map(
                                            (file, index) => (
                                              <div
                                                key={index}
                                                className="p-2 border rounded text-sm"
                                              >
                                                {file}
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" asChild>
                              <Link
                                to={`${APP_ROUTES.TRACK_COMPLAINT}?token=${complaint.token}`}
                              >
                                Track
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-20">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  No complaints found
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                    ? "No complaints match your search criteria"
                    : "You haven't submitted any complaints yet"}
                </p>
                <Button asChild>
                  <Link to={APP_ROUTES.CREATE_COMPLAINT}>
                    Submit Your First Complaint
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
