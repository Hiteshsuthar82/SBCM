import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/layout/Layout";
import { SystemConfig } from "@/lib/types";
import { configAPI } from "@/lib/services/api";
import { toast } from "@/hooks/use-toast";
import {
  Settings,
  Save,
  RotateCcw,
  Bell,
  Coins,
  Users,
  Shield,
  MapPin,
  ThumbsUp,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Award,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

interface ConfigForm extends SystemConfig {
  // Additional form-specific fields
}

export default function AdminConfig() {
  const [config, setConfig] = useState<ConfigForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Dynamic field form state
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState("");

  // Complaint type form state
  const [isComplaintTypeDialogOpen, setIsComplaintTypeDialogOpen] =
    useState(false);
  const [editingComplaintType, setEditingComplaintType] = useState<any | null>(
    null,
  );
  const [newComplaintType, setNewComplaintType] = useState({
    value: "",
    label: "",
    color: "bg-blue-500",
    enabled: true,
  });

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const response = await configAPI.get();
        // Transform API response to match our interface
        const apiConfig = response.data || {};
        
        const transformedConfig: ConfigForm = {
          enableRewards: apiConfig.enableRewards ?? true,
          enableLeaderboards: apiConfig.enableLeaderboards ?? true,
          enableNotifications: apiConfig.enableNotifications ?? true,
          enableLocationTracking: apiConfig.enableLocationTracking ?? true,
          enableLikeDislike: apiConfig.enableLikeDislike ?? true,
          stopType: apiConfig.stopType || "dropdown",
          dateTimeRequired: apiConfig.dateTimeRequired ?? true,
          showDateTimeField: apiConfig.showDateTimeField ?? true,
          showLocationField: apiConfig.showLocationField ?? true,
          showFileUploadField: apiConfig.showFileUploadField ?? true,
          minWithdrawalLimit: apiConfig.minWithdrawalLimit || 100,
          complaintApprovalHierarchy: apiConfig.complaintApprovalHierarchy || ["sub_admin", "admin", "super_admin"],
          withdrawalApprovalHierarchy: apiConfig.withdrawalApprovalHierarchy || ["admin", "super_admin"],
          complaintTypes: apiConfig.complaintTypes || [],
        };
        
        setConfig(transformedConfig);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockConfig: ConfigForm = {
        enableRewards: true,
        enableLeaderboards: true,
        enableNotifications: true,
        enableLocationTracking: true,
        enableLikeDislike: true,
        stopType: "dropdown",
        dateTimeRequired: true,
        showDateTimeField: true,
        showLocationField: true,
        showFileUploadField: true,
        minWithdrawalLimit: 100,
        complaintApprovalHierarchy: ["sub_admin", "admin", "super_admin"],
        withdrawalApprovalHierarchy: ["admin", "super_admin"],
        complaintTypes: [
          {
            value: "bus_delay",
            label: "Bus Delay",
            color: "bg-yellow-500",
            enabled: true,
          },
          {
            value: "ticketless_travel",
            label: "Ticketless Travel",
            color: "bg-red-500",
            enabled: true,
          },
          {
            value: "cleanliness",
            label: "Cleanliness Issue",
            color: "bg-blue-500",
            enabled: true,
          },
          {
            value: "staff_behavior",
            label: "Staff Behavior",
            color: "bg-purple-500",
            enabled: true,
          },
          {
            value: "overcrowding",
            label: "Overcrowding",
            color: "bg-orange-500",
            enabled: true,
          },
          {
            value: "safety",
            label: "Safety Concern",
            color: "bg-red-600",
            enabled: true,
          },
          {
            value: "technical",
            label: "Technical Issue",
            color: "bg-gray-500",
            enabled: true,
          },
          {
            value: "other",
            label: "Other",
            color: "bg-green-500",
            enabled: true,
          },
        ],
        pointsConfig: {
          complaintSubmission: 10,
          complaintApproval: 50,
          enableSubmissionPoints: true,
        },
        dynamicFields: {
          busNumber: {
            type: "text",
            required: true,
            options: [],
            visible: true,
          },
          routePreference: {
            type: "select",
            required: false,
            options: ["Route 1", "Route 2", "Route 3", "Route 8", "Route 15"],
            visible: true,
          },
          urgencyLevel: {
            type: "select",
            required: true,
            options: ["Low", "Medium", "High", "Critical"],
            visible: true,
          },
        },
      };

        setConfig(mockConfig);
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleConfigChange = (key: keyof ConfigForm, value: any) => {
    if (!config) return;
    setConfig({ ...config, [key]: value });
    setHasChanges(true);
  };

  const handlePointsConfigChange = (
    key: keyof ConfigForm["pointsConfig"],
    value: number,
  ) => {
    if (!config) return;
    setConfig({
      ...config,
      pointsConfig: { ...config.pointsConfig, [key]: value },
    });
    setHasChanges(true);
  };

  const handleHierarchyChange = (
    type: "complaintApprovalHierarchy" | "withdrawalApprovalHierarchy",
    index: number,
    value: string,
  ) => {
    if (!config) return;
    const newHierarchy = [...config[type]];
    newHierarchy[index] = value;
    setConfig({ ...config, [type]: newHierarchy });
    setHasChanges(true);
  };

  const addHierarchyLevel = (
    type: "complaintApprovalHierarchy" | "withdrawalApprovalHierarchy",
  ) => {
    if (!config) return;
    const newHierarchy = [...config[type], "sub_admin"];
    setConfig({ ...config, [type]: newHierarchy });
    setHasChanges(true);
  };

  const removeHierarchyLevel = (
    type: "complaintApprovalHierarchy" | "withdrawalApprovalHierarchy",
    index: number,
  ) => {
    if (!config) return;
    const newHierarchy = config[type].filter((_, i) => i !== index);
    setConfig({ ...config, [type]: newHierarchy });
    setHasChanges(true);
  };

  const addDynamicField = () => {
    if (!config || !newFieldName.trim()) return;

    const options =
      newFieldType === "select"
        ? newFieldOptions.split(",").map((opt) => opt.trim())
        : [];

    const newField = {
      type: newFieldType,
      required: newFieldRequired,
      options,
    };

    setConfig({
      ...config,
      dynamicFields: {
        ...config.dynamicFields,
        [newFieldName]: newField,
      },
    });

    setNewFieldName("");
    setNewFieldType("text");
    setNewFieldRequired(false);
    setNewFieldOptions("");
    setHasChanges(true);
  };

  const addComplaintType = () => {
    if (
      !config ||
      !newComplaintType.value.trim() ||
      !newComplaintType.label.trim()
    )
      return;

    const newTypes = [
      ...config.complaintTypes,
      {
        ...newComplaintType,
        value: newComplaintType.value.toLowerCase().replace(/\s+/g, "_"),
      },
    ];

    setConfig({ ...config, complaintTypes: newTypes });
    setNewComplaintType({
      value: "",
      label: "",
      color: "bg-blue-500",
      enabled: true,
    });
    setIsComplaintTypeDialogOpen(false);
    setHasChanges(true);
  };

  const editComplaintType = (type: any, index: number) => {
    setEditingComplaintType({ ...type, index });
    setNewComplaintType({ ...type });
    setIsComplaintTypeDialogOpen(true);
  };

  const updateComplaintType = () => {
    if (
      !config ||
      !editingComplaintType ||
      !newComplaintType.value.trim() ||
      !newComplaintType.label.trim()
    )
      return;

    const newTypes = [...config.complaintTypes];
    newTypes[editingComplaintType.index] = {
      ...newComplaintType,
      value: newComplaintType.value.toLowerCase().replace(/\s+/g, "_"),
    };

    setConfig({ ...config, complaintTypes: newTypes });
    setNewComplaintType({
      value: "",
      label: "",
      color: "bg-blue-500",
      enabled: true,
    });
    setEditingComplaintType(null);
    setIsComplaintTypeDialogOpen(false);
    setHasChanges(true);
  };

  const removeComplaintType = (index: number) => {
    if (!config) return;
    const newTypes = config.complaintTypes.filter((_, i) => i !== index);
    setConfig({ ...config, complaintTypes: newTypes });
    setHasChanges(true);
  };

  const removeDynamicField = (fieldName: string) => {
    if (!config) return;
    const newFields = { ...config.dynamicFields };
    delete newFields[fieldName];
    setConfig({ ...config, dynamicFields: newFields });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each configuration setting
      const configUpdates = [
        { key: 'enableRewards', value: config.enableRewards },
        { key: 'enableLeaderboards', value: config.enableLeaderboards },
        { key: 'enableNotifications', value: config.enableNotifications },
        { key: 'enableLocationTracking', value: config.enableLocationTracking },
        { key: 'enableLikeDislike', value: config.enableLikeDislike },
        { key: 'stopType', value: config.stopType },
        { key: 'dateTimeRequired', value: config.dateTimeRequired },
        { key: 'showDateTimeField', value: config.showDateTimeField },
        { key: 'showLocationField', value: config.showLocationField },
        { key: 'showFileUploadField', value: config.showFileUploadField },
        { key: 'minWithdrawalLimit', value: config.minWithdrawalLimit },
        { key: 'complaintApprovalHierarchy', value: config.complaintApprovalHierarchy },
        { key: 'withdrawalApprovalHierarchy', value: config.withdrawalApprovalHierarchy },
        { key: 'complaintTypes', value: config.complaintTypes },
      ];

      // Update each config setting
      for (const update of configUpdates) {
        await configAPI.update(update);
      }

      setHasChanges(false);
      toast({
        title: "Success",
        description: "Configuration saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save configuration",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // Reset to initial state
    window.location.reload();
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

  if (!config) return null;

  const roleOptions = [
    { value: "sub_admin", label: "Sub Admin" },
    { value: "admin", label: "Admin" },
    { value: "super_admin", label: "Super Admin" },
    { value: "editor", label: "Editor" },
    { value: "read_only", label: "Read Only" },
  ];

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Settings className="h-8 w-8 text-primary" />
              System Configuration
            </h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="bg-yellow-50">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!hasChanges || saving}>
                  {saving ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Save Configuration Changes
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to save these configuration changes?
                    This will affect the entire system and all users.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSave}>
                    Save Changes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Configuration Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="form">Form Fields</TabsTrigger>
            <TabsTrigger value="complaints">Complaint Types</TabsTrigger>
            <TabsTrigger value="points">Points & Rewards</TabsTrigger>
            <TabsTrigger value="approval">Approval Flow</TabsTrigger>
            <TabsTrigger value="fields">Dynamic Fields</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="stopType">Stop Input Type</Label>
                    <Select
                      value={config.stopType}
                      onValueChange={(value: "dropdown" | "text") =>
                        handleConfigChange("stopType", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dropdown">
                          Dropdown Selection
                        </SelectItem>
                        <SelectItem value="text">Text Input</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      How users select bus stops in complaint forms
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minWithdrawal">
                      Minimum Withdrawal Limit (₹)
                    </Label>
                    <Input
                      id="minWithdrawal"
                      type="number"
                      value={config.minWithdrawalLimit}
                      onChange={(e) =>
                        handleConfigChange(
                          "minWithdrawalLimit",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Minimum amount users can withdraw
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Form Requirements</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Date & Time Required</Label>
                      <p className="text-sm text-muted-foreground">
                        Require users to specify date and time for complaints
                      </p>
                    </div>
                    <Switch
                      checked={config.dateTimeRequired}
                      onCheckedChange={(checked) =>
                        handleConfigChange("dateTimeRequired", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Feature Toggles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-green-500" />
                        <Label>Rewards System</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable point-based rewards for user engagement
                      </p>
                    </div>
                    <Switch
                      checked={config.enableRewards}
                      onCheckedChange={(checked) =>
                        handleConfigChange("enableRewards", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <Label>Leaderboards</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Show user rankings and achievements
                      </p>
                    </div>
                    <Switch
                      checked={config.enableLeaderboards}
                      onCheckedChange={(checked) =>
                        handleConfigChange("enableLeaderboards", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-orange-500" />
                        <Label>Push Notifications</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Send push notifications to users
                      </p>
                    </div>
                    <Switch
                      checked={config.enableNotifications}
                      onCheckedChange={(checked) =>
                        handleConfigChange("enableNotifications", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-purple-500" />
                        <Label>Location Tracking</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Allow GPS location capture for complaints
                      </p>
                    </div>
                    <Switch
                      checked={config.enableLocationTracking}
                      onCheckedChange={(checked) =>
                        handleConfigChange("enableLocationTracking", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4 text-pink-500" />
                        <Label>Like/Dislike System</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable like/dislike functionality for announcements
                      </p>
                    </div>
                    <Switch
                      checked={config.enableLikeDislike}
                      onCheckedChange={(checked) =>
                        handleConfigChange("enableLikeDislike", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Form Field Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <Label>Show Date & Time Field</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Display date and time selection in complaint form
                      </p>
                    </div>
                    <Switch
                      checked={config.showDateTimeField}
                      onCheckedChange={(checked) =>
                        handleConfigChange("showDateTimeField", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <Label>Date & Time Required</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Make date and time field mandatory when visible
                      </p>
                    </div>
                    <Switch
                      checked={config.dateTimeRequired}
                      onCheckedChange={(checked) =>
                        handleConfigChange("dateTimeRequired", checked)
                      }
                      disabled={!config.showDateTimeField}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <Label>Show Location Field</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Display location selection/GPS in complaint form
                      </p>
                    </div>
                    <Switch
                      checked={config.showLocationField}
                      onCheckedChange={(checked) =>
                        handleConfigChange("showLocationField", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4 text-purple-500" />
                        <Label>Show File Upload Field</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Allow users to upload photos/videos as evidence
                      </p>
                    </div>
                    <Switch
                      checked={config.showFileUploadField}
                      onCheckedChange={(checked) =>
                        handleConfigChange("showFileUploadField", checked)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Complaint Types Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {config.complaintTypes.map((type, index) => (
                    <div
                      key={type.value}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded ${type.color}`}></div>
                        <div>
                          <p className="font-medium">{type.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {type.value}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={type.enabled}
                          onCheckedChange={(checked) => {
                            const newTypes = [...config.complaintTypes];
                            newTypes[index] = { ...type, enabled: checked };
                            handleConfigChange("complaintTypes", newTypes);
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => editComplaintType(type, index)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeComplaintType(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      setEditingComplaintType(null);
                      setNewComplaintType({
                        value: "",
                        label: "",
                        color: "bg-blue-500",
                        enabled: true,
                      });
                      setIsComplaintTypeDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Complaint Type
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="points" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  Points Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="submissionPoints">
                      Complaint Submission Points
                    </Label>
                    <Input
                      id="submissionPoints"
                      type="number"
                      value={config.pointsConfig.complaintSubmission}
                      onChange={(e) =>
                        handlePointsConfigChange(
                          "complaintSubmission",
                          parseInt(e.target.value) || 0,
                        )
                      }
                      disabled={!config.pointsConfig.enableSubmissionPoints}
                    />
                    <p className="text-sm text-muted-foreground">
                      Points awarded for submitting a complaint
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approvalPoints">
                      Complaint Approval Points
                    </Label>
                    <Input
                      id="approvalPoints"
                      type="number"
                      value={config.pointsConfig.complaintApproval}
                      onChange={(e) =>
                        handlePointsConfigChange(
                          "complaintApproval",
                          parseInt(e.target.value) || 0,
                        )
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Points awarded when complaint is approved
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-green-500" />
                          <Label>Give Points on Complaint Submission</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Enable or disable points for submitting complaints
                        </p>
                      </div>
                      <Switch
                        checked={config.pointsConfig.enableSubmissionPoints}
                        onCheckedChange={(checked) =>
                          handlePointsConfigChange(
                            "enableSubmissionPoints",
                            checked,
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900">
                        Points System Information
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Points encourage user engagement and help reduce
                        ticketless travel. Users can redeem points for cash
                        rewards through the withdrawal system.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Complaint Approval Hierarchy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Complaint Approval Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.complaintApprovalHierarchy.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 h-8 rounded-full">
                        {index + 1}
                      </Badge>
                      <Select
                        value={role}
                        onValueChange={(value) =>
                          handleHierarchyChange(
                            "complaintApprovalHierarchy",
                            index,
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {config.complaintApprovalHierarchy.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeHierarchyLevel(
                              "complaintApprovalHierarchy",
                              index,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addHierarchyLevel("complaintApprovalHierarchy")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Level
                  </Button>
                </CardContent>
              </Card>

              {/* Withdrawal Approval Hierarchy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Withdrawal Approval Hierarchy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {config.withdrawalApprovalHierarchy.map((role, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 h-8 rounded-full">
                        {index + 1}
                      </Badge>
                      <Select
                        value={role}
                        onValueChange={(value) =>
                          handleHierarchyChange(
                            "withdrawalApprovalHierarchy",
                            index,
                            value,
                          )
                        }
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {config.withdrawalApprovalHierarchy.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeHierarchyLevel(
                              "withdrawalApprovalHierarchy",
                              index,
                            )
                          }
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      addHierarchyLevel("withdrawalApprovalHierarchy")
                    }
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Level
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="fields" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Dynamic Form Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Field */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-semibold">Add New Field</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fieldName">Field Name</Label>
                      <Input
                        id="fieldName"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        placeholder="e.g., busNumber"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fieldType">Field Type</Label>
                      <Select
                        value={newFieldType}
                        onValueChange={setNewFieldType}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text Input</SelectItem>
                          <SelectItem value="select">Dropdown</SelectItem>
                          <SelectItem value="textarea">Text Area</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fieldOptions">
                        Options (for dropdown)
                      </Label>
                      <Input
                        id="fieldOptions"
                        value={newFieldOptions}
                        onChange={(e) => setNewFieldOptions(e.target.value)}
                        placeholder="Option1, Option2, Option3"
                        disabled={newFieldType !== "select"}
                      />
                    </div>
                    <div className="flex flex-col justify-end space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="fieldRequired"
                          checked={newFieldRequired}
                          onCheckedChange={setNewFieldRequired}
                        />
                        <Label htmlFor="fieldRequired">Required</Label>
                      </div>
                      <Button onClick={addDynamicField} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Existing Fields */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Existing Fields</h4>
                  {Object.entries(config.dynamicFields).map(
                    ([fieldName, fieldConfig]) => (
                      <div
                        key={fieldName}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{fieldName}</span>
                            <Badge variant="outline">{fieldConfig.type}</Badge>
                            {fieldConfig.required && (
                              <Badge variant="secondary">Required</Badge>
                            )}
                          </div>
                          {fieldConfig.options &&
                            fieldConfig.options.length > 0 && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Options: {fieldConfig.options.join(", ")}
                              </p>
                            )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDynamicField(fieldName)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Complaint Type Dialog */}
      <Dialog
        open={isComplaintTypeDialogOpen}
        onOpenChange={setIsComplaintTypeDialogOpen}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingComplaintType
                ? "Edit Complaint Type"
                : "Add Complaint Type"}
            </DialogTitle>
            <DialogDescription>
              {editingComplaintType
                ? "Update the details for this complaint type."
                : "Create a new complaint type for the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="typeValue">Type Value</Label>
              <Input
                id="typeValue"
                value={newComplaintType.value}
                onChange={(e) =>
                  setNewComplaintType({
                    ...newComplaintType,
                    value: e.target.value,
                  })
                }
                placeholder="e.g., bus_delay"
              />
              <p className="text-sm text-muted-foreground">
                Internal identifier (lowercase, underscores)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeLabel">Display Label</Label>
              <Input
                id="typeLabel"
                value={newComplaintType.label}
                onChange={(e) =>
                  setNewComplaintType({
                    ...newComplaintType,
                    label: e.target.value,
                  })
                }
                placeholder="e.g., Bus Delay"
              />
              <p className="text-sm text-muted-foreground">
                User-friendly name displayed in forms
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="typeColor">Color</Label>
              <Select
                value={newComplaintType.color}
                onValueChange={(value) =>
                  setNewComplaintType({
                    ...newComplaintType,
                    color: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-red-500">Red</SelectItem>
                  <SelectItem value="bg-blue-500">Blue</SelectItem>
                  <SelectItem value="bg-green-500">Green</SelectItem>
                  <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                  <SelectItem value="bg-purple-500">Purple</SelectItem>
                  <SelectItem value="bg-orange-500">Orange</SelectItem>
                  <SelectItem value="bg-pink-500">Pink</SelectItem>
                  <SelectItem value="bg-gray-500">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="typeEnabled"
                checked={newComplaintType.enabled}
                onCheckedChange={(checked) =>
                  setNewComplaintType({
                    ...newComplaintType,
                    enabled: checked,
                  })
                }
              />
              <Label htmlFor="typeEnabled">Enabled</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsComplaintTypeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingComplaintType ? updateComplaintType : addComplaintType
              }
            >
              {editingComplaintType ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
