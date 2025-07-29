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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { actionHistoryAPI } from "@/lib/services/api";
import {
  Search,
  History,
  User,
  FileText,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Users,
  Megaphone,
  BookOpen,
  Wallet,
  RefreshCw,
} from "lucide-react";

interface ActionLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "success" | "failed" | "warning";
}

const actionIcons: Record<string, any> = {
  login: User,
  logout: User,
  create: FileText,
  update: Settings,
  delete: XCircle,
  approve: CheckCircle,
  reject: XCircle,
  assign: Users,
  schedule: Clock,
  publish: Megaphone,
  view: Eye,
};

const resourceIcons: Record<string, any> = {
  complaint: FileText,
  announcement: Megaphone,
  rule: BookOpen,
  withdrawal: Wallet,
  user: User,
  role: Users,
  config: Settings,
};

export default function AdminHistory() {
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const loadActionLogs = async () => {
      setLoading(true);
      try {
        const response = await actionHistoryAPI.getAll();
        // Transform API response to match our interface
        const transformedLogs = response.data?.map((log: any) => ({
          id: log.id,
          adminId: log.adminId,
          adminName: log.adminName,
          action: log.action,
          resource: log.entity, // Map entity to resource for compatibility
          resourceId: log.entityId,
          details: log.details,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          timestamp: log.timestamp,
          status: "success", // Default status since API doesn't provide this
        })) || [];
        setActionLogs(transformedLogs);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockLogs: ActionLog[] = [
        {
          id: "1",
          adminId: "admin1",
          adminName: "John Admin",
          action: "approve",
          resource: "complaint",
          resourceId: "CMP001",
          details: "Approved complaint about bus delay on Route 15",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          timestamp: "2024-01-15T14:30:00Z",
          status: "success",
        },
        {
          id: "2",
          adminId: "admin2",
          adminName: "Sarah Manager",
          action: "create",
          resource: "announcement",
          resourceId: "ANN001",
          details: "Created new announcement about Route 8 maintenance",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timestamp: "2024-01-15T13:45:00Z",
          status: "success",
        },
        {
          id: "3",
          adminId: "admin1",
          adminName: "John Admin",
          action: "reject",
          resource: "withdrawal",
          resourceId: "WDR001",
          details: "Rejected withdrawal request - insufficient documentation",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          timestamp: "2024-01-15T12:20:00Z",
          status: "success",
        },
        {
          id: "4",
          adminId: "admin3",
          adminName: "Mike Supervisor",
          action: "update",
          resource: "rule",
          resourceId: "RULE001",
          details: "Updated passenger conduct rules - added mask requirement",
          ipAddress: "192.168.1.102",
          userAgent: "Mozilla/5.0 (X11; Linux x86_64)",
          timestamp: "2024-01-15T11:15:00Z",
          status: "success",
        },
        {
          id: "5",
          adminId: "admin2",
          adminName: "Sarah Manager",
          action: "delete",
          resource: "announcement",
          resourceId: "ANN002",
          details:
            "Deleted outdated announcement about temporary route changes",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timestamp: "2024-01-15T10:30:00Z",
          status: "success",
        },
        {
          id: "6",
          adminId: "admin1",
          adminName: "John Admin",
          action: "login",
          resource: "system",
          resourceId: "SYS001",
          details: "Admin login successful",
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          timestamp: "2024-01-15T09:00:00Z",
          status: "success",
        },
        {
          id: "7",
          adminId: "admin4",
          adminName: "Unknown User",
          action: "login",
          resource: "system",
          resourceId: "SYS002",
          details: "Failed login attempt - invalid credentials",
          ipAddress: "203.0.113.1",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
          timestamp: "2024-01-15T08:45:00Z",
          status: "failed",
        },
        {
          id: "8",
          adminId: "admin2",
          adminName: "Sarah Manager",
          action: "schedule",
          resource: "announcement",
          resourceId: "ANN003",
          details:
            "Scheduled announcement for weekend maintenance notification",
          ipAddress: "192.168.1.101",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timestamp: "2024-01-14T16:20:00Z",
          status: "success",
        },
      ];

        setActionLogs(mockLogs);
      } finally {
        setLoading(false);
      }
    };

    loadActionLogs();
  }, []);

  const filteredLogs = actionLogs.filter((log) => {
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    const matchesResource =
      resourceFilter === "all" || log.resource === resourceFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    const matchesDate =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(log.timestamp) >= dateRange.from &&
        new Date(log.timestamp) <= dateRange.to);

    return (
      matchesSearch &&
      matchesAction &&
      matchesResource &&
      matchesStatus &&
      matchesDate
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    totalActions: actionLogs.length,
    todayActions: actionLogs.filter(
      (log) =>
        new Date(log.timestamp).toDateString() === new Date().toDateString(),
    ).length,
    failedActions: actionLogs.filter((log) => log.status === "failed").length,
    uniqueAdmins: new Set(actionLogs.map((log) => log.adminId)).size,
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
              <History className="h-8 w-8 text-primary" />
              Admin Action History
            </h1>
            <p className="text-muted-foreground">
              Track and monitor all administrative actions in the system
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <History className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{stats.totalActions}</p>
              <p className="text-sm text-muted-foreground">Total Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.todayActions}</p>
              <p className="text-sm text-muted-foreground">Today's Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">{stats.failedActions}</p>
              <p className="text-sm text-muted-foreground">Failed Actions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.uniqueAdmins}</p>
              <p className="text-sm text-muted-foreground">Active Admins</p>
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
                  placeholder="Search actions, admins, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={resourceFilter}
                  onValueChange={setResourceFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="complaint">Complaints</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="rule">Rules</SelectItem>
                    <SelectItem value="withdrawal">Withdrawals</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
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

        {/* Action Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Action Logs ({filteredLogs.length} of {actionLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const ActionIcon = actionIcons[log.action] || FileText;
                  const ResourceIcon = resourceIcons[log.resource] || FileText;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.adminName}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.adminId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActionIcon className="h-4 w-4 text-primary" />
                          <Badge variant="outline">{log.action}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ResourceIcon className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{log.resource}</p>
                            <p className="text-sm text-muted-foreground">
                              {log.resourceId}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm truncate" title={log.details}>
                          {log.details}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <Badge className={getStatusColor(log.status)}>
                            {log.status}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(log.timestamp).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm font-mono">{log.ipAddress}</p>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredLogs.length === 0 && (
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No actions found</h3>
                <p className="text-muted-foreground">
                  No actions match your current filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
