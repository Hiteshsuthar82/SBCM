import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  GRANULAR_PERMISSIONS,
  PERMISSION_CATEGORIES,
  DEFAULT_ROLES,
  Role,
  Permission,
} from "@/lib/types/permissions";
import {
  Shield,
  Crown,
  Lock,
  Unlock,
  Plus,
  Edit,
  Save,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

export default function AdminRolesEnhanced() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const isSuperAdmin = admin?.role === "super_admin";

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    // Mock data - replace with real API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRoles(DEFAULT_ROLES);
    setLoading(false);
  };

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({
        title: "Error",
        description: "Role name is required",
        variant: "destructive",
      });
      return;
    }

    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: newRoleName,
      description: newRoleDescription,
      permissions: ["viewComplaints", "viewUsers"], // Default permissions
      subPermissions: {},
      isDefault: false,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRoles([...roles, newRole]);
    setNewRoleName("");
    setNewRoleDescription("");
    toast({
      title: "Success",
      description: "Role created successfully",
    });
  };

  const handleUpdateRole = (updatedRole: Role) => {
    setRoles(
      roles.map((role) =>
        role.id === updatedRole.id
          ? { ...updatedRole, updatedAt: new Date().toISOString() }
          : role,
      ),
    );
    setEditingRole(null);
    toast({
      title: "Success",
      description: "Role updated successfully",
    });
  };

  const togglePermission = (role: Role, permissionId: string) => {
    if (!isSuperAdmin && role.isSystem) {
      toast({
        title: "Access Denied",
        description: "Cannot modify system roles",
        variant: "destructive",
      });
      return;
    }

    const permission = GRANULAR_PERMISSIONS.find((p) => p.id === permissionId);
    const updatedPermissions = role.permissions.includes(permissionId)
      ? role.permissions.filter((p) => p !== permissionId)
      : [...role.permissions, permissionId];

    // Check if permission is required and prevent removal
    if (permission?.isRequired && role.permissions.includes(permissionId)) {
      toast({
        title: "Cannot Remove",
        description: "This permission is required for this role type",
        variant: "destructive",
      });
      return;
    }

    // Handle dependencies
    if (!role.permissions.includes(permissionId) && permission?.dependsOn) {
      const missingDeps = permission.dependsOn.filter(
        (dep) => !updatedPermissions.includes(dep),
      );
      if (missingDeps.length > 0) {
        updatedPermissions.push(...missingDeps);
        toast({
          title: "Dependencies Added",
          description: `Added required permissions: ${missingDeps.join(", ")}`,
        });
      }
    }

    const updatedRole = { ...role, permissions: updatedPermissions };
    handleUpdateRole(updatedRole);
  };

  const toggleSubPermission = (
    role: Role,
    permissionId: string,
    subPermissionId: string,
  ) => {
    if (!isSuperAdmin && role.isSystem) {
      toast({
        title: "Access Denied",
        description: "Cannot modify system roles",
        variant: "destructive",
      });
      return;
    }

    const currentSubPerms = role.subPermissions[permissionId] || [];
    const updatedSubPerms = currentSubPerms.includes(subPermissionId)
      ? currentSubPerms.filter((sp) => sp !== subPermissionId)
      : [...currentSubPerms, subPermissionId];

    const updatedRole = {
      ...role,
      subPermissions: {
        ...role.subPermissions,
        [permissionId]: updatedSubPerms,
      },
    };

    handleUpdateRole(updatedRole);
  };

  const getPermissionsByCategory = () => {
    const categorized: { [key: string]: Permission[] } = {};
    GRANULAR_PERMISSIONS.forEach((permission) => {
      if (!categorized[permission.category]) {
        categorized[permission.category] = [];
      }
      categorized[permission.category].push(permission);
    });
    return categorized;
  };

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const renderPermissionControls = (role: Role) => {
    const categorizedPermissions = getPermissionsByCategory();

    return (
      <div className="space-y-4">
        {Object.entries(categorizedPermissions).map(
          ([category, permissions]) => (
            <Card key={category}>
              <Collapsible
                open={expandedCategories.includes(category)}
                onOpenChange={() => toggleCategoryExpansion(category)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-accent/50">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span>{category}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {
                            permissions.filter((p) =>
                              role.permissions.includes(p.id),
                            ).length
                          }
                          /{permissions.length}
                        </Badge>
                        {expandedCategories.includes(category) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={role.permissions.includes(permission.id)}
                              onCheckedChange={() =>
                                togglePermission(role, permission.id)
                              }
                              disabled={
                                permission.isRequired ||
                                (!isSuperAdmin && role.isSystem)
                              }
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {permission.name}
                                </span>
                                {permission.isRequired && (
                                  <Lock className="h-3 w-3 text-muted-foreground" />
                                )}
                                {permission.dependsOn && (
                                  <AlertTriangle className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {permission.description}
                              </p>
                              {permission.dependsOn && (
                                <p className="text-xs text-yellow-600">
                                  Requires: {permission.dependsOn.join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Sub-permissions */}
                        {permission.subPermissions &&
                          role.permissions.includes(permission.id) && (
                            <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
                              <p className="text-sm font-medium text-muted-foreground">
                                Sub-permissions:
                              </p>
                              {permission.subPermissions.map((subPerm) => (
                                <div
                                  key={subPerm.id}
                                  className="flex items-center gap-3"
                                >
                                  <Checkbox
                                    checked={
                                      role.subPermissions[
                                        permission.id
                                      ]?.includes(subPerm.id) || false
                                    }
                                    onCheckedChange={() =>
                                      toggleSubPermission(
                                        role,
                                        permission.id,
                                        subPerm.id,
                                      )
                                    }
                                    disabled={!isSuperAdmin && role.isSystem}
                                  />
                                  <div>
                                    <span className="text-sm">
                                      {subPerm.name}
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                      {subPerm.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    ))}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ),
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
              <Shield className="h-8 w-8 text-primary" />
              Role & Permission Management
            </h1>
            <p className="text-muted-foreground">
              Manage admin roles and granular permissions
            </p>
          </div>
          {isSuperAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Role</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="Enter role name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Input
                      id="roleDescription"
                      value={newRoleDescription}
                      onChange={(e) => setNewRoleDescription(e.target.value)}
                      placeholder="Enter role description"
                    />
                  </div>
                  <Button onClick={handleCreateRole} className="w-full">
                    Create Role
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Super Admin Notice */}
        {isSuperAdmin && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <p className="text-yellow-800">
                  <strong>Super Admin Access:</strong> You can modify all
                  permissions and create new roles. Required permissions are
                  locked and cannot be removed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Roles List */}
        <div className="space-y-6">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.id === "super_admin" && (
                          <Crown className="h-5 w-5 text-yellow-500" />
                        )}
                        {role.isSystem && role.id !== "super_admin" && (
                          <Shield className="h-5 w-5 text-blue-500" />
                        )}
                        {!role.isSystem && (
                          <Users className="h-5 w-5 text-gray-500" />
                        )}
                        {role.name}
                        {role.isSystem && (
                          <Badge variant="outline">System</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {role.permissions.length} permissions
                    </Badge>
                    {(isSuperAdmin || !role.isSystem) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingRole(role)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Configure
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              Configure Permissions: {role.name}
                            </DialogTitle>
                          </DialogHeader>
                          {editingRole && renderPermissionControls(editingRole)}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
