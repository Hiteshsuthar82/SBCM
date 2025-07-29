import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  MapPin,
  BookOpen,
  Settings,
  RefreshCw,
  CheckCircle,
  X,
} from "lucide-react";

interface BusStop {
  id: string;
  name: string;
  code: string;
  route: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RuleCategory {
  id: string;
  name: string;
  description: string;
  rules: Rule[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Rule {
  id: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
}

export default function AdminCustomization() {
  const { toast } = useToast();
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [ruleCategories, setRuleCategories] = useState<RuleCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBusStop, setEditingBusStop] = useState<BusStop | null>(null);
  const [editingCategory, setEditingCategory] = useState<RuleCategory | null>(
    null,
  );
  const [newBusStop, setNewBusStop] = useState({
    name: "",
    code: "",
    route: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    // Mock data loading
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockBusStops: BusStop[] = [
      {
        id: "1",
        name: "Adajan",
        code: "ADA",
        route: "Route 1, 3, 5",
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        name: "Varachha Road",
        code: "VAR",
        route: "Route 2, 4, 6",
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "3",
        name: "Udhna",
        code: "UDH",
        route: "Route 1, 7, 8",
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
      },
    ];

    const mockCategories: RuleCategory[] = [
      {
        id: "1",
        name: "Passenger Guidelines",
        description: "Rules for passenger behavior and conduct",
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        rules: [
          {
            id: "1",
            title: "Valid Ticket Required",
            description: "All passengers must have valid tickets",
            order: 1,
            active: true,
          },
          {
            id: "2",
            title: "No Smoking",
            description: "Smoking is strictly prohibited",
            order: 2,
            active: true,
          },
        ],
      },
      {
        id: "2",
        name: "Safety Regulations",
        description: "Safety rules and emergency procedures",
        active: true,
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        rules: [
          {
            id: "3",
            title: "Emergency Exit Procedures",
            description: "Follow emergency exit instructions",
            order: 1,
            active: true,
          },
        ],
      },
    ];

    setBusStops(mockBusStops);
    setRuleCategories(mockCategories);
    setLoading(false);
  };

  const handleAddBusStop = () => {
    if (!newBusStop.name || !newBusStop.code) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const busStop: BusStop = {
      id: Date.now().toString(),
      name: newBusStop.name,
      code: newBusStop.code,
      route: newBusStop.route,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBusStops([...busStops, busStop]);
    setNewBusStop({ name: "", code: "", route: "" });
    toast({
      title: "Success",
      description: "Bus stop added successfully",
    });
  };

  const handleUpdateBusStop = (updatedBusStop: BusStop) => {
    setBusStops(
      busStops.map((stop) =>
        stop.id === updatedBusStop.id
          ? { ...updatedBusStop, updatedAt: new Date().toISOString() }
          : stop,
      ),
    );
    setEditingBusStop(null);
    toast({
      title: "Success",
      description: "Bus stop updated successfully",
    });
  };

  const handleDeleteBusStop = (id: string) => {
    setBusStops(busStops.filter((stop) => stop.id !== id));
    toast({
      title: "Success",
      description: "Bus stop deleted successfully",
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const category: RuleCategory = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description,
      rules: [],
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRuleCategories([...ruleCategories, category]);
    setNewCategory({ name: "", description: "" });
    toast({
      title: "Success",
      description: "Rule category added successfully",
    });
  };

  const handleUpdateCategory = (updatedCategory: RuleCategory) => {
    setRuleCategories(
      ruleCategories.map((cat) =>
        cat.id === updatedCategory.id
          ? { ...updatedCategory, updatedAt: new Date().toISOString() }
          : cat,
      ),
    );
    setEditingCategory(null);
    toast({
      title: "Success",
      description: "Rule category updated successfully",
    });
  };

  const handleDeleteCategory = (id: string) => {
    setRuleCategories(ruleCategories.filter((cat) => cat.id !== id));
    toast({
      title: "Success",
      description: "Rule category deleted successfully",
    });
  };

  const toggleBusStopStatus = (id: string) => {
    setBusStops(
      busStops.map((stop) =>
        stop.id === id
          ? {
              ...stop,
              active: !stop.active,
              updatedAt: new Date().toISOString(),
            }
          : stop,
      ),
    );
  };

  const toggleCategoryStatus = (id: string) => {
    setRuleCategories(
      ruleCategories.map((cat) =>
        cat.id === id
          ? { ...cat, active: !cat.active, updatedAt: new Date().toISOString() }
          : cat,
      ),
    );
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              System Customization
            </h1>
            <p className="text-muted-foreground">
              Manage bus stops, rules, and system content
            </p>
          </div>
        </div>

        <Tabs defaultValue="bus-stops" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bus-stops">Bus Stops</TabsTrigger>
            <TabsTrigger value="rules">Rules & Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="bus-stops">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Bus Stops Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Bus Stop */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Add New Bus Stop</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="busStopName">Name *</Label>
                        <Input
                          id="busStopName"
                          value={newBusStop.name}
                          onChange={(e) =>
                            setNewBusStop({
                              ...newBusStop,
                              name: e.target.value,
                            })
                          }
                          placeholder="Bus stop name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="busStopCode">Code *</Label>
                        <Input
                          id="busStopCode"
                          value={newBusStop.code}
                          onChange={(e) =>
                            setNewBusStop({
                              ...newBusStop,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="e.g., ADA"
                          maxLength={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="busStopRoute">Routes</Label>
                        <Input
                          id="busStopRoute"
                          value={newBusStop.route}
                          onChange={(e) =>
                            setNewBusStop({
                              ...newBusStop,
                              route: e.target.value,
                            })
                          }
                          placeholder="Route 1, 2, 3"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddBusStop} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Stop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bus Stops List */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Existing Bus Stops ({busStops.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Routes</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {busStops.map((stop) => (
                          <TableRow key={stop.id}>
                            <TableCell className="font-medium">
                              {stop.name}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{stop.code}</Badge>
                            </TableCell>
                            <TableCell>{stop.route}</TableCell>
                            <TableCell>
                              <Badge
                                variant={stop.active ? "default" : "secondary"}
                              >
                                {stop.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleBusStopStatus(stop.id)}
                                >
                                  {stop.active ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingBusStop(stop)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Bus Stop
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {stop.name}"? This action cannot be
                                        undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteBusStop(stop.id)
                                        }
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Rules & Categories Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Category */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Add New Rule Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="categoryName">Category Name *</Label>
                        <Input
                          id="categoryName"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                          }
                          placeholder="Category name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="categoryDescription">
                          Description *
                        </Label>
                        <Input
                          id="categoryDescription"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory({
                              ...newCategory,
                              description: e.target.value,
                            })
                          }
                          placeholder="Category description"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleAddCategory} className="w-full">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Category
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rule Categories List */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Rule Categories ({ruleCategories.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Rules Count</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ruleCategories.map((category) => (
                          <TableRow key={category.id}>
                            <TableCell className="font-medium">
                              {category.name}
                            </TableCell>
                            <TableCell>{category.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {category.rules.length} rules
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  category.active ? "default" : "secondary"
                                }
                              >
                                {category.active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleCategoryStatus(category.id)
                                  }
                                >
                                  {category.active ? (
                                    <X className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete Rule Category
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete "
                                        {category.name}"? This will also delete
                                        all rules in this category.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
                                        }
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
