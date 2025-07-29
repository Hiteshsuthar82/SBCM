import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { Withdrawal, WithdrawalTimeline } from "@/lib/types";
import { withdrawalsAPI } from "@/lib/services/api";
import {
  Search,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar as CalendarIcon,
  DollarSign,
  RefreshCw,
  AlertTriangle,
  Plus,
} from "lucide-react";

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const loadWithdrawals = async () => {
      setLoading(true);
      try {
        const response = await withdrawalsAPI.getUserWithdrawals();
        // Transform API response to match our interface
        const transformedWithdrawals = response.data?.map((withdrawal: any) => ({
          id: withdrawal._id || withdrawal.id,
          amount: withdrawal.amount,
          method: withdrawal.method,
          status: withdrawal.status,
          requestedAt: withdrawal.requestedAt || withdrawal.createdAt,
          processedAt: withdrawal.processedAt,
          reason: withdrawal.reason,
          adminNotes: withdrawal.adminNotes,
          timeline: withdrawal.timeline || [],
        })) || [];
        setWithdrawals(transformedWithdrawals);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockWithdrawals: Withdrawal[] = [
        {
          id: "WDR001",
          userId: "user1",
          userName: "Current User",
          points: 100,
          method: "UPI",
          status: "approved",
          paymentDetails: { upiId: "user@paytm" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-12T15:30:00Z",
            },
            {
              action: "Under Review",
              status: "processing",
              adminId: "admin1",
              adminName: "Admin User",
              timestamp: "2024-01-12T16:00:00Z",
            },
            {
              action: "Approved",
              status: "approved",
              description: "Payment processed successfully",
              adminId: "admin1",
              adminName: "Admin User",
              timestamp: "2024-01-12T17:30:00Z",
            },
          ],
          createdAt: "2024-01-12T15:30:00Z",
          updatedAt: "2024-01-12T17:30:00Z",
        },
        {
          id: "WDR002",
          userId: "user1",
          userName: "Current User",
          points: 250,
          method: "Bank Transfer",
          status: "pending",
          paymentDetails: {
            bankAccount: "1234567890",
            ifsc: "SBIN0000123",
          },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-15T10:20:00Z",
            },
          ],
          createdAt: "2024-01-15T10:20:00Z",
          updatedAt: "2024-01-15T10:20:00Z",
        },
        {
          id: "WDR003",
          userId: "user1",
          userName: "Current User",
          points: 50,
          method: "UPI",
          status: "rejected",
          reason: "Insufficient account verification",
          paymentDetails: { upiId: "user@gpay" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-10T14:15:00Z",
            },
            {
              action: "Rejected",
              status: "rejected",
              reason: "Insufficient account verification",
              adminId: "admin2",
              adminName: "Admin Manager",
              timestamp: "2024-01-10T16:45:00Z",
            },
          ],
          createdAt: "2024-01-10T14:15:00Z",
          updatedAt: "2024-01-10T16:45:00Z",
        },
        {
          id: "WDR004",
          userId: "user1",
          userName: "Current User",
          points: 75,
          method: "UPI",
          status: "processing",
          paymentDetails: { upiId: "user@phonepe" },
          timeline: [
            {
              action: "Request Created",
              status: "pending",
              timestamp: "2024-01-08T11:30:00Z",
            },
            {
              action: "Under Review",
              status: "processing",
              adminId: "admin1",
              adminName: "Admin User",
              timestamp: "2024-01-08T13:00:00Z",
            },
          ],
          createdAt: "2024-01-08T11:30:00Z",
          updatedAt: "2024-01-08T13:00:00Z",
        },
      ];

        setWithdrawals(mockWithdrawals);
      } finally {
        setLoading(false);
      }
    };

    loadWithdrawals();
  }, []);

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch =
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || withdrawal.status === statusFilter;

    const matchesDate =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(withdrawal.createdAt) >= dateRange.from &&
        new Date(withdrawal.createdAt) <= dateRange.to);

    return matchesSearch && matchesStatus && matchesDate;
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
    approved: withdrawals.filter((w) => w.status === "approved").length,
    pending: withdrawals.filter((w) => w.status === "pending").length,
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
              Withdrawal History
            </h1>
            <p className="text-muted-foreground">
              Track all your point withdrawal requests
            </p>
          </div>
          <Button
            onClick={() => (window.location.href = APP_ROUTES.WITHDRAWAL)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Withdrawal
          </Button>
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
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-sm text-muted-foreground">Approved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">₹{stats.totalAmount}</p>
              <p className="text-sm text-muted-foreground">Total Withdrawn</p>
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
                  placeholder="Search by request ID or method..."
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
                  variant={
                    statusFilter === "processing" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setStatusFilter("processing")}
                >
                  Processing
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-32">
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateRange.from
                        ? format(dateRange.from, "MMM dd")
                        : "Date Range"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={{
                        from: dateRange.from,
                        to: dateRange.to,
                      }}
                      onSelect={(range) =>
                        setDateRange({
                          from: range?.from,
                          to: range?.to,
                        })
                      }
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawals Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Withdrawal Requests ({filteredWithdrawals.length} of{" "}
              {withdrawals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
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
                      <div className="font-medium">{withdrawal.id}</div>
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
                      <div className="text-sm">
                        <p>
                          {new Date(withdrawal.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-muted-foreground">
                          {new Date(withdrawal.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedWithdrawal(withdrawal)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Withdrawal Details</DialogTitle>
                          </DialogHeader>
                          {selectedWithdrawal && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Request ID
                                  </label>
                                  <p className="font-medium">
                                    {selectedWithdrawal.id}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Amount
                                  </label>
                                  <p className="font-medium">
                                    ₹{selectedWithdrawal.points}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Method
                                  </label>
                                  <p>{selectedWithdrawal.method}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Status
                                  </label>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(selectedWithdrawal.status)}
                                    <Badge
                                      className={getStatusColor(
                                        selectedWithdrawal.status,
                                      )}
                                    >
                                      {selectedWithdrawal.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {selectedWithdrawal.reason && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Reason
                                  </label>
                                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                                      <p className="text-red-700 text-sm">
                                        {selectedWithdrawal.reason}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {selectedWithdrawal.paymentDetails && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">
                                    Payment Details
                                  </label>
                                  <div className="mt-1 p-3 bg-muted rounded-lg">
                                    {Object.entries(
                                      selectedWithdrawal.paymentDetails,
                                    ).map(([key, value]) => (
                                      <div
                                        key={key}
                                        className="flex justify-between py-1"
                                      >
                                        <span className="text-sm capitalize">
                                          {key.replace(/([A-Z])/g, " $1")}:
                                        </span>
                                        <span className="text-sm font-medium">
                                          {value}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Timeline
                                </label>
                                <div className="mt-2 space-y-3">
                                  {selectedWithdrawal.timeline.map(
                                    (event, index) => (
                                      <div
                                        key={index}
                                        className="flex items-start gap-3 p-3 bg-muted rounded-lg"
                                      >
                                        {getStatusIcon(event.status)}
                                        <div className="flex-1">
                                          <div className="flex items-center justify-between">
                                            <span className="font-medium">
                                              {event.action}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(
                                                event.timestamp,
                                              ).toLocaleString()}
                                            </span>
                                          </div>
                                          {event.description && (
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {event.description}
                                            </p>
                                          )}
                                          {event.reason && (
                                            <p className="text-sm text-red-600 mt-1">
                                              Reason: {event.reason}
                                            </p>
                                          )}
                                          {event.adminName && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                              By: {event.adminName}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredWithdrawals.length === 0 && (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No withdrawals found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No withdrawals match your criteria"
                    : "You haven't made any withdrawal requests yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
