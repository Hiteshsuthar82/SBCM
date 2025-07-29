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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { Withdrawal } from "@/lib/types";
import { withdrawalsAPI } from "@/lib/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  Search,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  Eye,
  RefreshCw,
  Download,
} from "lucide-react";

export default function AdminWithdrawals() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve",
  );
  const [approvalReason, setApprovalReason] = useState("");

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await withdrawalsAPI.getAll();
      // Transform API response to match our interface
      const transformedWithdrawals = response.data.map((withdrawal: any) => ({
        ...withdrawal,
        userName: withdrawal.user?.name || withdrawal.userName,
        userId: withdrawal.user?.id || withdrawal.userId,
      }));
      setWithdrawals(transformedWithdrawals);
    } catch (error) {
      // Silently fall back to mock data in development
      console.warn("API not available, using mock data:", error);
      // Fallback to mock data for development
      const mockWithdrawals: Withdrawal[] = [
        {
          id: "1",
          userId: "user1",
          userName: "Raj Patel",
          points: 500,
          method: "UPI",
          status: "pending",
          paymentDetails: { upiId: "raj@paytm" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-15T10:30:00Z",
            },
          ],
          createdAt: "2024-01-15T10:30:00Z",
          updatedAt: "2024-01-15T10:30:00Z",
        },
        {
          id: "2",
          userId: "user2",
          userName: "Priya Shah",
          points: 1000,
          method: "Bank Transfer",
          status: "approved",
          paymentDetails: { bankAccount: "1234567890", ifsc: "SBIN0000123" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-14T15:20:00Z",
            },
            {
              action: "Approved",
              status: "approved",
              adminId: "admin1",
              adminName: "Admin User",
              timestamp: "2024-01-14T16:00:00Z",
            },
          ],
          createdAt: "2024-01-14T15:20:00Z",
          updatedAt: "2024-01-14T16:00:00Z",
        },
        {
          id: "3",
          userId: "user3",
          userName: "Amit Kumar",
          points: 250,
          method: "UPI",
          status: "rejected",
          reason: "Insufficient verification documents",
          paymentDetails: { upiId: "amit@gpay" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-13T12:00:00Z",
            },
            {
              action: "Rejected",
              status: "rejected",
              reason: "Insufficient verification documents",
              adminId: "admin1",
              adminName: "Admin User",
              timestamp: "2024-01-13T14:30:00Z",
            },
          ],
          createdAt: "2024-01-13T12:00:00Z",
          updatedAt: "2024-01-13T14:30:00Z",
        },
      ];
      setWithdrawals(mockWithdrawals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApproval = async () => {
    if (!selectedWithdrawal) return;

    try {
      const approvalData = {
        status: approvalAction === "approve" ? "approved" : "rejected",
        reason: approvalAction === "reject" ? approvalReason : undefined,
        description:
          approvalAction === "approve" ? "Withdrawal approved" : approvalReason,
      };

      const response = await withdrawalsAPI.approve(
        selectedWithdrawal.id,
        approvalData,
      );

      // Update local state with API response
      const updatedWithdrawal = {
        ...selectedWithdrawal,
        ...response.data,
        timeline: [
          ...selectedWithdrawal.timeline,
          {
            action: approvalAction === "approve" ? "Approved" : "Rejected",
            status: approvalAction === "approve" ? "approved" : "rejected",
            reason: approvalAction === "reject" ? approvalReason : undefined,
            adminId: admin?.id || "admin1",
            adminName: admin?.name || "Current Admin",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setWithdrawals((prev) =>
        prev.map((w) =>
          w.id === selectedWithdrawal.id ? updatedWithdrawal : w,
        ),
      );

      toast({
        title: `Withdrawal ${approvalAction === "approve" ? "Approved" : "Rejected"}`,
        description: `Withdrawal request has been ${approvalAction === "approve" ? "approved" : "rejected"}.`,
      });

      setIsApprovalDialogOpen(false);
      setApprovalReason("");
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to process withdrawal request.",
        variant: "destructive",
      });
    }
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || withdrawal.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "processing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
    approved: withdrawals.filter((w) => w.status === "approved").length,
    totalAmount: withdrawals
      .filter((w) => w.status === "approved")
      .reduce((sum, w) => sum + w.points, 0),
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Wallet className="h-8 w-8 text-primary" />
              Withdrawal Management
            </h1>
            <p className="text-muted-foreground">
              Review and manage user withdrawal requests
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadWithdrawals}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Wallet className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">₹{stats.totalAmount}</p>
              <p className="text-sm text-muted-foreground">Total Disbursed</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name or request ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("pending")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("approved")}
            >
              Approved
            </Button>
            <Button
              variant={statusFilter === "rejected" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("rejected")}
            >
              Rejected
            </Button>
          </div>
        </div>

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWithdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{withdrawal.userName}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {withdrawal.userId}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{withdrawal.points}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{withdrawal.method}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(withdrawal.status)}
                        <Badge className={getStatusColor(withdrawal.status)}>
                          {withdrawal.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Withdrawal Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">
                                    User Name
                                  </Label>
                                  <p>{withdrawal.userName}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Amount
                                  </Label>
                                  <p>₹{withdrawal.points}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Method
                                  </Label>
                                  <p>{withdrawal.method}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">
                                    Status
                                  </Label>
                                  <Badge
                                    className={getStatusColor(
                                      withdrawal.status,
                                    )}
                                  >
                                    {withdrawal.status}
                                  </Badge>
                                </div>
                              </div>
                              {withdrawal.paymentDetails && (
                                <div>
                                  <Label className="text-sm font-medium">
                                    Payment Details
                                  </Label>
                                  <div className="mt-1 p-2 bg-muted rounded">
                                    {Object.entries(
                                      withdrawal.paymentDetails,
                                    ).map(([key, value]) => (
                                      <p key={key} className="text-sm">
                                        {key}: {value}
                                      </p>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div>
                                <Label className="text-sm font-medium">
                                  Timeline
                                </Label>
                                <div className="mt-2 space-y-2">
                                  {withdrawal.timeline.map((event, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      {getStatusIcon(event.status)}
                                      <span>{event.action}</span>
                                      <span className="text-muted-foreground">
                                        {new Date(
                                          event.timestamp,
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        {withdrawal.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setApprovalAction("approve");
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setApprovalAction("reject");
                                setIsApprovalDialogOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog
          open={isApprovalDialogOpen}
          onOpenChange={setIsApprovalDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {approvalAction === "approve" ? "Approve" : "Reject"} Withdrawal
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedWithdrawal && (
                <div>
                  <p>
                    <strong>User:</strong> {selectedWithdrawal.userName}
                  </p>
                  <p>
                    <strong>Amount:</strong> ₹{selectedWithdrawal.points}
                  </p>
                </div>
              )}
              {approvalAction === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Rejection *</Label>
                  <Textarea
                    id="reason"
                    value={approvalReason}
                    onChange={(e) => setApprovalReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    required
                  />
                </div>
              )}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsApprovalDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApproval}
                  disabled={
                    approvalAction === "reject" && !approvalReason.trim()
                  }
                  className={
                    approvalAction === "approve"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }
                >
                  {approvalAction === "approve" ? "Approve" : "Reject"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
