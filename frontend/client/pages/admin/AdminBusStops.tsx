import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
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
import Layout from "@/components/layout/Layout";
import { busStopsAPI } from "@/lib/services/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Download,
  Upload,
  Eye,
  EyeOff,
  Map,
} from "lucide-react";

interface BusStop {
  id: string;
  name: string;
  code: string;
  route: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  enabled: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBusStops() {
  const { admin } = useAuth();
  const { toast } = useToast();
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStop, setEditingStop] = useState<BusStop | null>(null);
  const [newStop, setNewStop] = useState({
    name: "",
    code: "",
    route: "",
    latitude: "",
    longitude: "",
    address: "",
    enabled: true,
    order: 0,
  });

  const routes = [
    "Route 1",
    "Route 2",
    "Route 3",
    "Route 5",
    "Route 8",
    "Route 12",
    "Route 15",
  ];

  const loadBusStops = async () => {
    setLoading(true);
    try {
      const response = await busStopsAPI.getAll();
      setBusStops(response.data || []);
    } catch (error) {
      console.error("Failed to load bus stops:", error);
      toast({
        title: "Error",
        description: "Failed to load bus stops. Using mock data.",
        variant: "destructive",
      });

      // Mock data for development
      setBusStops([
        {
          id: "1",
          name: "Adajan",
          code: "ADJ",
          route: "Route 1",
          latitude: 21.1938,
          longitude: 72.7933,
          address: "Adajan Circle, Surat",
          enabled: true,
          order: 1,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          name: "Varachha Road",
          code: "VRC",
          route: "Route 2",
          latitude: 21.218,
          longitude: 72.8347,
          address: "Varachha Road, Surat",
          enabled: true,
          order: 2,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          name: "Udhna",
          code: "UDH",
          route: "Route 3",
          latitude: 21.1702,
          longitude: 72.7662,
          address: "Udhna Station, Surat",
          enabled: false,
          order: 3,
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusStops();
  }, []);

  const handleAdd = async () => {
    if (!newStop.name.trim() || !newStop.code.trim() || !newStop.route) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stopData = {
        name: newStop.name.trim(),
        code: newStop.code.trim().toUpperCase(),
        route: newStop.route,
        latitude: newStop.latitude ? parseFloat(newStop.latitude) : undefined,
        longitude: newStop.longitude
          ? parseFloat(newStop.longitude)
          : undefined,
        address: newStop.address.trim() || undefined,
        enabled: newStop.enabled,
        order: newStop.order || busStops.length + 1,
      };

      const response = await busStopsAPI.create(stopData);
      setBusStops([...busStops, response.data]);

      toast({
        title: "Success",
        description: "Bus stop created successfully.",
      });

      setNewStop({
        name: "",
        code: "",
        route: "",
        latitude: "",
        longitude: "",
        address: "",
        enabled: true,
        order: 0,
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create bus stop.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async () => {
    if (
      !editingStop ||
      !newStop.name.trim() ||
      !newStop.code.trim() ||
      !newStop.route
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const stopData = {
        name: newStop.name.trim(),
        code: newStop.code.trim().toUpperCase(),
        route: newStop.route,
        latitude: newStop.latitude ? parseFloat(newStop.latitude) : undefined,
        longitude: newStop.longitude
          ? parseFloat(newStop.longitude)
          : undefined,
        address: newStop.address.trim() || undefined,
        enabled: newStop.enabled,
        order: newStop.order,
      };

      const response = await busStopsAPI.update(editingStop.id, stopData);
      setBusStops(
        busStops.map((stop) =>
          stop.id === editingStop.id ? response.data : stop,
        ),
      );

      toast({
        title: "Success",
        description: "Bus stop updated successfully.",
      });

      setEditingStop(null);
      setIsAddDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update bus stop.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (stopId: string) => {
    try {
      await busStopsAPI.delete(stopId);
      setBusStops(busStops.filter((stop) => stop.id !== stopId));

      toast({
        title: "Success",
        description: "Bus stop deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete bus stop.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (stop: BusStop) => {
    try {
      if (stop.enabled) {
        await busStopsAPI.deactivate(stop.id);
      } else {
        await busStopsAPI.activate(stop.id);
      }

      setBusStops(
        busStops.map((s) =>
          s.id === stop.id ? { ...s, enabled: !s.enabled } : s,
        ),
      );

      toast({
        title: "Success",
        description: `Bus stop ${stop.enabled ? "disabled" : "enabled"} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update bus stop status.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (stop: BusStop) => {
    setEditingStop(stop);
    setNewStop({
      name: stop.name,
      code: stop.code,
      route: stop.route,
      latitude: stop.latitude?.toString() || "",
      longitude: stop.longitude?.toString() || "",
      address: stop.address || "",
      enabled: stop.enabled,
      order: stop.order,
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setNewStop({
      name: "",
      code: "",
      route: "",
      latitude: "",
      longitude: "",
      address: "",
      enabled: true,
      order: 0,
    });
    setEditingStop(null);
  };

  const filteredStops = busStops.filter((stop) => {
    const matchesSearch =
      stop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.route.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoute = routeFilter === "all" || stop.route === routeFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && stop.enabled) ||
      (statusFilter === "disabled" && !stop.enabled);

    return matchesSearch && matchesRoute && matchesStatus;
  });

  const stats = {
    total: busStops.length,
    enabled: busStops.filter((s) => s.enabled).length,
    disabled: busStops.filter((s) => !s.enabled).length,
    routes: new Set(busStops.map((s) => s.route)).size,
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
              <MapPin className="h-8 w-8 text-primary" />
              Bus Stops Management
            </h1>
            <p className="text-muted-foreground">
              Manage BRTS bus stops, routes, and locations
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadBusStops}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog
              open={isAddDialogOpen}
              onOpenChange={(open) => {
                if (!open) resetForm();
                setIsAddDialogOpen(open);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bus Stop
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingStop ? "Edit Bus Stop" : "Add New Bus Stop"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingStop
                      ? "Update the bus stop information."
                      : "Add a new bus stop to the BRTS network."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Stop Name *</Label>
                      <Input
                        id="name"
                        value={newStop.name}
                        onChange={(e) =>
                          setNewStop({ ...newStop, name: e.target.value })
                        }
                        placeholder="e.g., Adajan Circle"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="code">Stop Code *</Label>
                      <Input
                        id="code"
                        value={newStop.code}
                        onChange={(e) =>
                          setNewStop({
                            ...newStop,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="e.g., ADJ"
                        maxLength={5}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route">Route *</Label>
                    <Select
                      value={newStop.route}
                      onValueChange={(value) =>
                        setNewStop({ ...newStop, route: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route} value={route}>
                            {route}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={newStop.address}
                      onChange={(e) =>
                        setNewStop({ ...newStop, address: e.target.value })
                      }
                      placeholder="Full address (optional)"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="any"
                        value={newStop.latitude}
                        onChange={(e) =>
                          setNewStop({ ...newStop, latitude: e.target.value })
                        }
                        placeholder="21.1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="any"
                        value={newStop.longitude}
                        onChange={(e) =>
                          setNewStop({ ...newStop, longitude: e.target.value })
                        }
                        placeholder="72.1234"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enabled"
                      checked={newStop.enabled}
                      onCheckedChange={(checked) =>
                        setNewStop({ ...newStop, enabled: checked })
                      }
                    />
                    <Label htmlFor="enabled">Enabled</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={editingStop ? handleEdit : handleAdd}>
                    {editingStop ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stops</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MapPin className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Stops</p>
                  <p className="text-2xl font-bold">{stats.enabled}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Inactive Stops
                  </p>
                  <p className="text-2xl font-bold">{stats.disabled}</p>
                </div>
                <EyeOff className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Routes</p>
                  <p className="text-2xl font-bold">{stats.routes}</p>
                </div>
                <Map className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, code, or route..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={routeFilter} onValueChange={setRouteFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Routes</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route} value={route}>
                        {route}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="enabled">Enabled</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bus Stops Table */}
        <Card>
          <CardHeader>
            <CardTitle>Bus Stops ({filteredStops.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Stop Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStops.map((stop) => (
                    <TableRow key={stop.id}>
                      <TableCell className="font-medium">{stop.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{stop.code}</Badge>
                      </TableCell>
                      <TableCell>{stop.route}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {stop.address || "N/A"}
                      </TableCell>
                      <TableCell>
                        {stop.latitude && stop.longitude ? (
                          <span className="text-sm text-muted-foreground">
                            {stop.latitude.toFixed(4)},{" "}
                            {stop.longitude.toFixed(4)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={stop.enabled ? "default" : "secondary"}>
                          {stop.enabled ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStatus(stop)}
                          >
                            {stop.enabled ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(stop)}
                          >
                            <Edit className="h-4 w-4" />
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
                                  Delete Bus Stop
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{stop.name}"?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(stop.id)}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
