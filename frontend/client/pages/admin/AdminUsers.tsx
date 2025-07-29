import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { User } from "@/lib/types";
import { usersAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Eye,
  Edit,
  MoreHorizontal,
  Download,
  Filter,
  Mail,
  Phone,
  Calendar,
  Award,
  MessageSquare,
  TrendingUp,
  RefreshCw,
} from "lucide-react";

interface UserStats {
  totalComplaints: number;
  approvedComplaints: number;
  totalPoints: number;
  joinDate: string;
  lastActivity: string;
  status: "active" | "inactive" | "suspended";
}

interface ExtendedUser extends User {
  stats: UserStats;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<ExtendedUser | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        const response = await usersAPI.getAll();
        // Transform API response to match our interface
        const transformedUsers = response.data?.map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || user.mobile,
          address: user.address || "",
          points: user.points || 0,
          progress: user.progress || 0,
          stats: {
            totalComplaints: user.totalComplaints || 0,
            approvedComplaints: user.approvedComplaints || 0,
            totalPoints: user.points || 0,
            joinDate: user.createdAt || new Date().toISOString(),
            lastActivity: user.lastActivity || user.updatedAt || new Date().toISOString(),
            status: user.status || "active",
          },
        })) || [];
        setUsers(transformedUsers);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockUsers: ExtendedUser[] = [
        {
          id: "user1",
          name: "Rajesh Patel",
          email: "rajesh.patel@email.com",
          phone: "+91-9876543210",
          address: "Adajan, Surat",
          points: 250,
          progress: 85,
          stats: {
            totalComplaints: 12,
            approvedComplaints: 10,
            totalPoints: 250,
            joinDate: "2023-09-15T08:30:00Z",
            lastActivity: "2024-01-16T14:20:00Z",
            status: "active",
          },
        },
        {
          id: "user2",
          name: "Priya Sharma",
          email: "priya.sharma@email.com",
          phone: "+91-9876543211",
          address: "Varachha Road, Surat",
          points: 180,
          progress: 75,
          stats: {
            totalComplaints: 8,
            approvedComplaints: 7,
            totalPoints: 180,
            joinDate: "2023-10-20T11:15:00Z",
            lastActivity: "2024-01-15T09:45:00Z",
            status: "active",
          },
        },
        {
          id: "user3",
          name: "Amit Kumar",
          email: "amit.kumar@email.com",
          phone: "+91-9876543212",
          address: "Udhna, Surat",
          points: 50,
          progress: 30,
          stats: {
            totalComplaints: 3,
            approvedComplaints: 2,
            totalPoints: 50,
            joinDate: "2023-12-01T16:45:00Z",
            lastActivity: "2024-01-10T12:30:00Z",
            status: "inactive",
          },
        },
        {
          id: "user4",
          name: "Sneha Desai",
          email: "sneha.desai@email.com",
          phone: "+91-9876543213",
          address: "Katargam, Surat",
          points: 320,
          progress: 95,
          stats: {
            totalComplaints: 18,
            approvedComplaints: 16,
            totalPoints: 320,
            joinDate: "2023-08-10T10:20:00Z",
            lastActivity: "2024-01-16T16:10:00Z",
            status: "active",
          },
        },
        {
          id: "user5",
          name: "Vikram Singh",
          email: "vikram.singh@email.com",
          phone: "+91-9876543214",
          address: "Rundh, Surat",
          points: 0,
          progress: 10,
          stats: {
            totalComplaints: 1,
            approvedComplaints: 0,
            totalPoints: 0,
            joinDate: "2024-01-05T14:30:00Z",
            lastActivity: "2024-01-08T11:15:00Z",
            status: "suspended",
          },
        },
      ];

        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" || user.stats.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      if (newStatus === "active") {
        await usersAPI.activate(userId);
      } else if (newStatus === "inactive") {
        await usersAPI.deactivate(userId);
      } else {
        // For suspended status, use update API
        await usersAPI.update(userId, { status: newStatus });
      }
      
      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, stats: { ...user.stats, status: newStatus as any } }
            : user,
        ),
      );
      
      toast({
        title: "Success",
        description: `User status updated to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.stats.status === "active").length,
    inactive: users.filter((u) => u.stats.status === "inactive").length,
    suspended: users.filter((u) => u.stats.status === "suspended").length,
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
      <div className="container max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor all registered users
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Users
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserCheck className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserX className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <UserX className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">{stats.suspended}</p>
              <p className="text-sm text-muted-foreground">Suspended</p>
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
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Users ({filteredUsers.length} of {users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Complaints</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </p>
                        <p className="text-muted-foreground">{user.address}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">
                          {user.stats.totalPoints}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{user.stats.totalComplaints} total</p>
                        <p className="text-green-600">
                          {user.stats.approvedComplaints} approved
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(user.stats.status)}>
                        {user.stats.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(user.stats.lastActivity).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Full Name
                                    </label>
                                    <p className="font-medium">
                                      {selectedUser.name}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Email
                                    </label>
                                    <p>{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Phone
                                    </label>
                                    <p>{selectedUser.phone}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Address
                                    </label>
                                    <p>{selectedUser.address}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                  <Card>
                                    <CardContent className="p-4 text-center">
                                      <MessageSquare className="h-6 w-6 mx-auto text-blue-500 mb-2" />
                                      <p className="text-xl font-bold">
                                        {selectedUser.stats.totalComplaints}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Total Complaints
                                      </p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4 text-center">
                                      <Award className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                                      <p className="text-xl font-bold">
                                        {selectedUser.stats.totalPoints}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Total Points
                                      </p>
                                    </CardContent>
                                  </Card>
                                  <Card>
                                    <CardContent className="p-4 text-center">
                                      <TrendingUp className="h-6 w-6 mx-auto text-green-500 mb-2" />
                                      <p className="text-xl font-bold">
                                        {selectedUser.progress}%
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Profile Complete
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Join Date
                                    </label>
                                    <p>
                                      {new Date(
                                        selectedUser.stats.joinDate,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-muted-foreground">
                                      Last Activity
                                    </label>
                                    <p>
                                      {new Date(
                                        selectedUser.stats.lastActivity,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Change Status
                                  </label>
                                  <Select
                                    value={selectedUser.stats.status}
                                    onValueChange={(value) =>
                                      handleStatusChange(selectedUser.id, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">
                                        Active
                                      </SelectItem>
                                      <SelectItem value="inactive">
                                        Inactive
                                      </SelectItem>
                                      <SelectItem value="suspended">
                                        Suspended
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Notification
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all"
                    ? "No users match your search criteria"
                    : "No users registered yet"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
