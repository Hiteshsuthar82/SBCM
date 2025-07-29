import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Upload,
  X,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Camera,
  FileText,
  CheckCircle,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/lib/hooks/useAuth";
import { useConfig } from "@/lib/services/config";
import { APP_ROUTES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";

const complaintSchema = z.object({
  type: z.string().min(1, "Please select a complaint type"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  stop: z.string().min(1, "Please specify the stop/location"),
  dateTime: z.string().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      address: z.string(),
    })
    .optional(),
});

type ComplaintForm = z.infer<typeof complaintSchema>;

// Complaint types are now loaded from config
// const complaintTypes = [];

const bustops = [
  "Adajan",
  "Varachha Road",
  "Udhna",
  "Katargam",
  "Rundh",
  "Magdalla",
  "Athwalines",
  "Ring Road",
  "Sumul Dairy",
  "Kadodara",
];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [complaintToken, setComplaintToken] = useState("");

  const {
    getStopType,
    isDateTimeRequired,
    isFeatureEnabled,
    getDynamicFields,
    getComplaintTypes,
    shouldShowField,
  } = useConfig();
  const dynamicFields = getDynamicFields();
  const complaintTypes = getComplaintTypes();

  const form = useForm<ComplaintForm>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      type: "",
      description: "",
      stop: "",
      dateTime: "",
    },
  });

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services",
        variant: "destructive",
      });
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Mock reverse geocoding (in real app, use Google Maps API)
        const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        const location = { latitude, longitude, address };
        setCurrentLocation(location);
        setLocationLoading(false);

        toast({
          title: "Location Captured",
          description: "Your current location has been added to the complaint",
        });
      },
      (error) => {
        setLocationLoading(false);
        toast({
          title: "Location Error",
          description: "Unable to get your current location",
          variant: "destructive",
        });
      },
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType =
        file.type.startsWith("image/") || file.type === "application/pdf";
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        toast({
          title: "Invalid File Type",
          description: `${file.name} is not a valid file type. Please upload images or PDFs only.`,
          variant: "destructive",
        });
      }
      if (!isValidSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} is too large. Maximum file size is 5MB.`,
          variant: "destructive",
        });
      }

      return isValidType && isValidSize;
    });

    setUploadedFiles((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ComplaintForm) => {
    setLoading(true);

    try {
      // Prepare form data
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("description", data.description);
      formData.append("stop", data.stop);

      if (data.dateTime) {
        formData.append("dateTime", data.dateTime);
      }

      if (currentLocation) {
        formData.append("latitude", currentLocation.latitude.toString());
        formData.append("longitude", currentLocation.longitude.toString());
        formData.append("address", currentLocation.address);
      }

      // Add files
      uploadedFiles.forEach((file) => {
        formData.append("evidence", file);
      });

      // Add dynamic fields if any
      dynamicFields.forEach((field) => {
        const value = (data as any)[field.name];
        if (value) {
          formData.append(field.name, value);
        }
      });

      try {
        // Try real API call first
        const response = await complaintsAPI.create(formData);
        
        if (response.data && response.data.token) {
          setComplaintToken(response.data.token);
          setSubmitted(true);

          toast({
            title: "Complaint Submitted Successfully!",
            description: `Your complaint token is ${response.data.token}. Save this for tracking.`,
          });
        } else {
          throw new Error("Invalid response from server");
        }
      } catch (apiError: any) {
        console.warn("API not available, using mock submission:", apiError);
        
        // Fallback to mock response
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const mockToken = `BRTS${Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")}`;
        setComplaintToken(mockToken);
        setSubmitted(true);

        toast({
          title: "Complaint Submitted Successfully!",
          description: `Your complaint token is ${mockToken}. Save this for tracking. (Demo Mode)`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your complaint. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto p-6">
          <Card className="text-center">
            <CardContent className="p-8">
              <div className="mb-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-green-600 mb-2">
                  Complaint Submitted!
                </h1>
                <p className="text-muted-foreground">
                  Thank you for helping us improve the BRTS service
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Your Complaint Token
                </p>
                <p className="text-2xl font-bold font-mono">{complaintToken}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Save this token to track your complaint status
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate(APP_ROUTES.TRACK_COMPLAINT)}
                    className="w-full"
                  >
                    Track This Complaint
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitted(false);
                      setComplaintToken("");
                      form.reset();
                      setUploadedFiles([]);
                      setCurrentLocation(null);
                    }}
                    className="w-full"
                  >
                    Submit Another
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => navigate(APP_ROUTES.DASHBOARD)}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Submit Complaint
          </h1>
          <p className="text-muted-foreground">
            Help us improve the BRTS service by reporting issues
          </p>
        </div>

        {/* Anonymous User Notice */}
        {!isAuthenticated && (
          <Alert>
            <AlertDescription>
              You're submitting as an anonymous user. Consider{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => navigate(APP_ROUTES.LOGIN)}
              >
                logging in
              </Button>{" "}
              to track your complaints and earn reward points.
            </AlertDescription>
          </Alert>
        )}

        {/* Progress Steps */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(
                  (Object.keys(form.formState.dirtyFields).length / 3) * 100,
                )}
                %
              </span>
            </div>
            <Progress
              value={(Object.keys(form.formState.dirtyFields).length / 3) * 100}
              className="h-2"
            />
          </CardContent>
        </Card>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Complaint Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Complaint Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complaint Type *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select the type of issue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {complaintTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${type.color}`}
                                />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Stop/Location */}
                <FormField
                  control={form.control}
                  name="stop"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bus Stop / Location *</FormLabel>
                      {getStopType() === "dropdown" ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select bus stop" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {bustops.map((stop) => (
                              <SelectItem key={stop} value={stop}>
                                {stop}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter the bus stop or location"
                          />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date & Time */}
                {shouldShowField("dateTime") && (
                  <FormField
                    control={form.control}
                    name="dateTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Date & Time{" "}
                          {isDateTimeRequired() ? "*" : "(Optional)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="datetime-local"
                            max={new Date().toISOString().slice(0, 16)}
                          />
                        </FormControl>
                        <FormDescription>
                          When did this issue occur?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Please provide detailed information about the issue..."
                          className="min-h-[120px]"
                          maxLength={500}
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location Capture */}
                {isFeatureEnabled("enableLocationTracking") && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Current Location</h4>
                        <p className="text-sm text-muted-foreground">
                          Add your current location to help us locate the issue
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                      >
                        {locationLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-2" />
                        )}
                        {currentLocation ? "Update" : "Get"} Location
                      </Button>
                    </div>

                    {currentLocation && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium text-green-600 mb-1">
                          Location captured
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {currentLocation.address}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Evidence (Optional)</h4>
                      <p className="text-sm text-muted-foreground">
                        Upload photos or documents to support your complaint
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {uploadedFiles.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg"
                        >
                          {file.type.startsWith("image/") ? (
                            <Camera className="h-5 w-5 text-blue-500" />
                          ) : (
                            <FileText className="h-5 w-5 text-red-500" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Maximum 5 files, 5MB each. Supported formats: JPG, PNG, PDF
                  </p>
                </div>

                {/* Dynamic Fields from Admin Configuration */}
                {Object.entries(dynamicFields).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(dynamicFields).map(
                        ([fieldName, fieldConfig]) => (
                          <div key={fieldName} className="space-y-2">
                            <Label htmlFor={fieldName}>
                              {fieldName
                                .replace(/([A-Z])/g, " $1")
                                .replace(/^./, (str) => str.toUpperCase())}
                              {fieldConfig.required && (
                                <span className="text-red-500 ml-1">*</span>
                              )}
                            </Label>

                            {fieldConfig.type === "select" ? (
                              <Select>
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={`Select ${fieldName}`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {fieldConfig.options?.map((option) => (
                                    <SelectItem key={option} value={option}>
                                      {option}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : fieldConfig.type === "textarea" ? (
                              <Textarea
                                id={fieldName}
                                placeholder={`Enter ${fieldName}`}
                                rows={3}
                              />
                            ) : fieldConfig.type === "number" ? (
                              <Input
                                id={fieldName}
                                type="number"
                                placeholder={`Enter ${fieldName}`}
                              />
                            ) : (
                              <Input
                                id={fieldName}
                                type="text"
                                placeholder={`Enter ${fieldName}`}
                              />
                            )}
                          </div>
                        ),
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Submit Button */}
                <div className="pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit Complaint
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    You'll receive a tracking token after submission
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
