import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { rolesAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Shield,
  Edit2,
  Trash2,
  Users,
  Lock,
  Unlock,
  Crown,
  Eye,
  RefreshCw,
  Save,
} from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Compulsory permissions for admin roles (cannot be removed)
const compulsoryAdminPermissions = [
  "viewComplaints",
  "manageAnnouncements",
  "manageRules",
  "viewUsers",
];

// Super Admin has all permissions and cannot be edited
const superAdminPermissions = [
  "viewComplaints",
  "approveComplaints",
  "assignComplaints",
  "manageAnnouncements",
  "scheduleAnnouncements",
  "manageRules",
  "viewUsers",
  "manageUsers",
  "viewWithdrawals",
  "approveWithdrawals",
  "manageRoles",
  "updateConfig",
  "viewAnalytics",
  "viewHistory",
];

const availablePermissions: Permission[] = [
  // Complaint Management
  {
    id: "viewComplaints",
    name: "View Complaints",
    category: "Complaints",
    description: "View all complaints in the system",
  },
  {
    id: "approveComplaints",
    name: "Approve Complaints",
    category: "Complaints",
    description: "Approve or reject complaint submissions",
  },
  {
    id: "assignComplaints",
    name: "Assign Complaints",
    category: "Complaints",
    description: "Assign complaints to other admins",
  },
  // Announcements
  {
    id: "manageAnnouncements",
    name: "Manage Announcements",
    category: "Content",
    description: "Create, edit, and delete announcements",
  },
  {
    id: "scheduleAnnouncements",
    name: "Schedule Announcements",
    category: "Content",
    description: "Schedule announcements for future publication",
  },
  // Rules Management
  {
    id: "manageRules",
    name: "Manage Rules",
    category: "Content",
    description: "Create, edit, and delete system rules",
  },
  // User Management
  {
    id: "viewUsers",
    name: "View Users",
    category: "Users",
    description: "View user profiles and information",
  },
  {
    id: "manageUsers",
    name: "Manage Users",
    category: "Users",
    description: "Edit user profiles and manage accounts",
  },
  // Withdrawals
  {
    id: "viewWithdrawals",
    name: "View Withdrawals",
    category: "Finance",
    description: "View withdrawal requests",
  },
  {
    id: "approveWithdrawals",
    name: "Approve Withdrawals",
    category: "Finance",
    description: "Approve or reject withdrawal requests",
  },
  // System Administration
  {
    id: "manageRoles",
    name: "Manage Roles",
    category: "Admin",
    description: "Create and edit user roles and permissions",
  },
  {
    id: "updateConfig",
    name: "Update Configuration",
    category: "Admin",
    description: "Modify system configuration settings",
  },
  {
    id: "viewAnalytics",
    name: "View Analytics",
    category: "Admin",
    description: "Access system analytics and reports",
  },
  {
    id: "viewHistory",
    name: "View Action History",
    category: "Admin",
    description: "View admin action logs and history",
  },
];

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      try {
        const response = await rolesAPI.getAll();
        // Transform API response to match our interface
        const transformedRoles = response.data?.map((role: any) => ({
          id: role._id || role.id,
          name: role.name,
          description: role.description || "",
          permissions: role.permissions || [],
          userCount: role.userCount || 0,
          isDefault: role.isDefault || false,
          createdAt: role.createdAt,
          updatedAt: role.updatedAt,
        })) || [];
        setRoles(transformedRoles);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockRoles: Role[] = [
          {
            id: "1",
            name: "Super Admin",
            description: "Full system access with all permissions",
            permissions: availablePermissions.map((p) => p.id),
            userCount: 1,
            isDefault: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "2",
            name: "Admin",
            description: "Standard admin with most permissions",
            permissions: [
              "viewComplaints",
              "approveComplaints",
              "manageAnnouncements",
              "manageRules",
              "viewUsers",
              "viewWithdrawals",
              "approveWithdrawals",
            ],
            userCount: 5,
            isDefault: true,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "3",
            name: "Moderator",
            description: "Content moderation and basic complaint handling",
            permissions: [
              "viewComplaints",
              "manageAnnouncements",
              "manageRules",
              "viewUsers",
            ],
            userCount: 8,
            isDefault: false,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
          {
            id: "4",
            name: "Finance Admin",
            description: "Specialized role for withdrawal management",
            permissions: [
              "viewWithdrawals",
              "approveWithdrawals",
              "viewUsers",
              "viewAnalytics",
            ],
            userCount: 2,
            isDefault: false,
            createdAt: "2024-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
          },
        ];
        setRoles(mockRoles);
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  const resetForm = () => {
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  const handleSubmit = async () => {
    if (!roleName.trim() || !roleDescription.trim()) return;

    try {
      const roleData = {
        name: roleName,
        description: roleDescription,
        permissions: selectedPermissions,
      };

      if (editingRole) {
        // Update existing role
        await rolesAPI.update(editingRole.id, roleData);
        setRoles((prev) =>
          prev.map((r) =>
            r.id === editingRole.id
              ? {
                  ...r,
                  name: roleName,
                  description: roleDescription,
                  permissions: selectedPermissions,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        );
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        const response = await rolesAPI.create(roleData);
        const newRole: Role = {
          id: response.data._id || response.data.id,
          name: roleName,
          description: roleDescription,
          permissions: selectedPermissions,
          userCount: 0,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRoles((prev) => [newRole, ...prev]);
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save role",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await rolesAPI.delete(id);
      setRoles((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const togglePermission = (permissionId: string) => {
    // Prevent removing compulsory permissions from admin roles
    const isCompulsory = compulsoryAdminPermissions.includes(permissionId);
    const isAdminRole =
      editingRole?.name === "Admin" ||
      (roleName.toLowerCase().includes("admin") && roleName !== "Super Admin");

    if (
      isCompulsory &&
      isAdminRole &&
      selectedPermissions.includes(permissionId)
    ) {
      // Don't allow removing compulsory permissions from admin roles
      return;
    }

    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId],
    );
  };

  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const permissionsByCategory = availablePermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>,
  );

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
              <Shield className="h-8 w-8 text-primary" />
              Roles & Permissions
            </h1>
            <p className="text-muted-foreground">
              Manage user roles and access permissions
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
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRole ? "Edit Role" : "Create New Role"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roleName">Role Name *</Label>
                    <Input
                      id="roleName"
                      value={roleName}
                      onChange={(e) => setRoleName(e.target.value)}
                      placeholder="Enter role name..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleDescription">Description *</Label>
                    <Input
                      id="roleDescription"
                      value={roleDescription}
                      onChange={(e) => setRoleDescription(e.target.value)}
                      placeholder="Enter role description..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    Permissions ({selectedPermissions.length}/
                    {availablePermissions.length})
                  </Label>
                  {Object.entries(permissionsByCategory).map(
                    ([category, permissions]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {permissions.map((permission) => {
                            const isCompulsory =
                              compulsoryAdminPermissions.includes(
                                permission.id,
                              );
                            const isAdminRole =
                              editingRole?.name === "Admin" ||
                              (roleName.toLowerCase().includes("admin") &&
                                roleName !== "Super Admin");
                            const isSuperAdmin =
                              editingRole?.name === "Super Admin" ||
                              roleName === "Super Admin";
                            const isDisabled =
                              (isCompulsory && isAdminRole) || isSuperAdmin;

                            return (
                              <div
                                key={permission.id}
                                className="flex items-start space-x-3"
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={selectedPermissions.includes(
                                    permission.id,
                                  )}
                                  onCheckedChange={() =>
                                    togglePermission(permission.id)
                                  }
                                  disabled={isDisabled}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Label
                                      htmlFor={permission.id}
                                      className={`text-sm font-medium cursor-pointer ${isDisabled ? "text-muted-foreground" : ""}`}
                                    >
                                      {permission.name}
                                    </Label>
                                    {isCompulsory && isAdminRole && (
                                      <Lock
                                        className="h-3 w-3 text-yellow-500"
                                        title="Required for admin roles"
                                      />
                                    )}
                                    {isSuperAdmin && (
                                      <Crown
                                        className="h-3 w-3 text-purple-500"
                                        title="Super Admin permission"
                                      />
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                    {isCompulsory && isAdminRole && (
                                      <span className="text-yellow-600 font-medium">
                                        {" "}
                                        (Required for admin roles)
                                      </span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    ),
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
                    disabled={!roleName.trim() || !roleDescription.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingRole ? "Update Role" : "Create Role"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{roles.length}</p>
              <p className="text-sm text-muted-foreground">Total Roles</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Lock className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">
                {availablePermissions.length}
              </p>
              <p className="text-sm text-muted-foreground">Permissions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-8 w-8 mx-auto text-yellow-500 mb-2" />
              <p className="text-2xl font-bold">
                {roles.filter((r) => r.isDefault).length}
              </p>
              <p className="text-sm text-muted-foreground">Default Roles</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Users</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-medium">{role.name}</span>
                          {role.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {role.description}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{role.userCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {role.permissions.length} permissions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {role.isDefault ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          System
                        </Badge>
                      ) : (
                        <Badge variant="outline">Custom</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(role.updatedAt).toLocaleDateString()}
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
                              <DialogTitle>
                                {role.name} - Permissions
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {Object.entries(permissionsByCategory).map(
                                ([category, permissions]) => {
                                  const categoryPermissions =
                                    permissions.filter((p) =>
                                      role.permissions.includes(p.id),
                                    );
                                  if (categoryPermissions.length === 0)
                                    return null;

                                  return (
                                    <div key={category}>
                                      <h4 className="font-semibold mb-2">
                                        {category}
                                      </h4>
                                      <div className="space-y-1">
                                        {categoryPermissions.map(
                                          (permission) => (
                                            <div
                                              key={permission.id}
                                              className="flex items-center gap-2"
                                            >
                                              <Unlock className="h-4 w-4 text-green-500" />
                                              <span className="text-sm">
                                                {permission.name}
                                              </span>
                                            </div>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  );
                                },
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(role)}
                          disabled={
                            role.name === "Super Admin" ||
                            (role.isDefault && role.name === "Admin")
                          }
                          title={
                            role.name === "Super Admin"
                              ? "Super Admin role cannot be edited"
                              : role.isDefault
                                ? "System roles have limited editing"
                                : ""
                          }
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={role.isDefault || role.userCount > 0}
                              title={
                                role.isDefault
                                  ? "Cannot delete system roles"
                                  : role.userCount > 0
                                    ? "Cannot delete roles with active users"
                                    : ""
                              }
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Role</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{role.name}"?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(role.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
