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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { Rule } from "@/lib/types";
import { rulesAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Eye,
  Users,
  Bus,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Save,
} from "lucide-react";

interface RuleForm {
  title: string;
  description: string;
  category: string;
  importance: "high" | "medium" | "low";
}

const categoryOptions = [
  "Passenger Conduct",
  "Safety Guidelines",
  "Luggage & Belongings",
  "Payment & Tickets",
  "Complaint System",
  "Driver Guidelines",
  "Emergency Procedures",
  "General Rules",
];

const categoryIcons: Record<string, any> = {
  "Passenger Conduct": Users,
  "Safety Guidelines": Shield,
  "Luggage & Belongings": Bus,
  "Payment & Tickets": DollarSign,
  "Complaint System": BookOpen,
  "Driver Guidelines": Users,
  "Emergency Procedures": AlertTriangle,
  "General Rules": BookOpen,
};

const importanceColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function AdminRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImportance, setSelectedImportance] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [viewingRule, setViewingRule] = useState<Rule | null>(null);
  const [form, setForm] = useState<RuleForm>({
    title: "",
    description: "",
    category: "General Rules",
    importance: "medium",
  });

  // Mock data for demonstration
  useEffect(() => {
    const loadRules = async () => {
      setLoading(true);
      try {
        const response = await rulesAPI.getAll();
        // Transform API response to match our interface
        const transformedRules = response.data?.map((rule: any) => ({
          id: rule._id || rule.id,
          category: rule.category,
          description: rule.description,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        })) || [];
        setRules(transformedRules);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockRules: Rule[] = [
        {
          id: "1",
          category: "Passenger Conduct",
          description:
            "All passengers must purchase a valid ticket before boarding the bus. Traveling without a ticket is strictly prohibited and may result in penalties.",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "2",
          category: "Passenger Conduct",
          description:
            "Seats marked for senior citizens, pregnant women, and differently-abled passengers must be vacated upon request. It is mandatory to offer these seats to those who need them.",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "3",
          category: "Safety Guidelines",
          description:
            "Familiarize yourself with emergency exit locations. Do not block emergency exits with luggage or personal belongings. In case of emergency, follow driver instructions calmly.",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "4",
          category: "Safety Guidelines",
          description:
            "Board and alight the bus only when it comes to a complete stop. Use designated doors and wait for passengers to exit before boarding.",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
        {
          id: "5",
          category: "Payment & Tickets",
          description:
            "BRTS accepts cash, UPI, credit/debit cards, and mobile wallets for ticket purchases. Keep your payment receipt until you reach your destination.",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

        setRules(mockRules);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      category: "General Rules",
      importance: "medium",
    });
    setEditingRule(null);
  };

  const handleSubmit = async () => {
    if (!form.description.trim() || !form.category.trim()) {
      return;
    }

    try {
      const ruleData = {
        category: form.category,
        description: form.description,
      };

      if (editingRule) {
        // Update existing rule
        await rulesAPI.update(editingRule.id, ruleData);
        setRules((prev) =>
          prev.map((r) =>
            r.id === editingRule.id
              ? {
                  ...r,
                  category: form.category,
                  description: form.description,
                  updatedAt: new Date().toISOString(),
                }
              : r,
          ),
        );
        toast({
          title: "Success",
          description: "Rule updated successfully",
        });
      } else {
        // Create new rule
        const response = await rulesAPI.create(ruleData);
        const newRule: Rule = {
          id: response.data._id || response.data.id,
          category: form.category,
          description: form.description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setRules((prev) => [newRule, ...prev]);
        toast({
          title: "Success",
          description: "Rule created successfully",
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save rule",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rule: Rule) => {
    setEditingRule(rule);
    setForm({
      title: "", // Rules don't have titles in the type
      description: rule.description,
      category: rule.category,
      importance: "medium", // Default since not in type
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await rulesAPI.delete(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      toast({
        title: "Success",
        description: "Rule deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete rule",
        variant: "destructive",
      });
    }
  };

  const categories = Array.from(
    new Set(rules.map((rule) => rule.category)),
  ).sort();

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || rule.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const rulesByCategory = categories.reduce(
    (acc, category) => {
      acc[category] = filteredRules.filter(
        (rule) => rule.category === category,
      );
      return acc;
    },
    {} as Record<string, Rule[]>,
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
              <BookOpen className="h-8 w-8 text-primary" />
              Manage Rules & Guidelines
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and manage rules and guidelines for the Surat BRTS
              system
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
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? "Edit Rule" : "Add New Rule"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      setForm({ ...form, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Rule Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    placeholder="Enter the rule description..."
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importance">Importance Level</Label>
                  <Select
                    value={form.importance}
                    onValueChange={(value: "high" | "medium" | "low") =>
                      setForm({ ...form, importance: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
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
                    disabled={!form.description.trim() || !form.category.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {editingRule ? "Update Rule" : "Add Rule"}
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
              <BookOpen className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold">{rules.length}</p>
              <p className="text-sm text-muted-foreground">Total Rules</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-red-500 mb-2" />
              <p className="text-2xl font-bold">
                {
                  rules.filter(
                    (r) =>
                      r.updatedAt >
                      new Date(
                        Date.now() - 7 * 24 * 60 * 60 * 1000,
                      ).toISOString(),
                  ).length
                }
              </p>
              <p className="text-sm text-muted-foreground">Recent Updates</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-muted-foreground">Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All
            </Button>
            {categories.slice(0, 4).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category.split(" ")[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-6">
          {filteredRules.length > 0 ? (
            Object.entries(rulesByCategory).map(([category, categoryRules]) => {
              if (categoryRules.length === 0) return null;

              const Icon = categoryIcons[category] || BookOpen;

              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {category}
                      <Badge variant="secondary">
                        {categoryRules.length} rules
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryRules.map((rule) => (
                        <Card
                          key={rule.id}
                          className="border-l-4 border-l-primary"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="text-foreground leading-relaxed mb-3">
                                  {rule.description}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>
                                    Created:{" "}
                                    {new Date(
                                      rule.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>
                                    Updated:{" "}
                                    {new Date(
                                      rule.updatedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <Badge variant="outline">
                                    Rule #{rule.id}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setViewingRule(rule)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Rule Details</DialogTitle>
                                    </DialogHeader>
                                    {viewingRule && (
                                      <div className="space-y-4">
                                        <div>
                                          <Label className="text-sm font-medium">
                                            Category
                                          </Label>
                                          <p className="text-foreground">
                                            {viewingRule.category}
                                          </p>
                                        </div>
                                        <div>
                                          <Label className="text-sm font-medium">
                                            Description
                                          </Label>
                                          <p className="text-foreground leading-relaxed mt-1">
                                            {viewingRule.description}
                                          </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              Created
                                            </Label>
                                            <p>
                                              {new Date(
                                                viewingRule.createdAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                          <div>
                                            <Label className="text-xs font-medium text-muted-foreground">
                                              Last Updated
                                            </Label>
                                            <p>
                                              {new Date(
                                                viewingRule.updatedAt,
                                              ).toLocaleDateString()}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(rule)}
                                >
                                  <Edit2 className="h-4 w-4" />
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
                                        Delete Rule
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this
                                        rule? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(rule.id)}
                                        className="bg-red-500 hover:bg-red-600"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No rules found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || selectedCategory !== "all"
                  ? "No rules match your criteria"
                  : "Get started by adding your first rule"}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
