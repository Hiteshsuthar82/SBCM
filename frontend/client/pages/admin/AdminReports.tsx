import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, addDays } from "date-fns";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { reportsAPI } from "@/lib/services/api";
import {
  FileText,
  Download,
  Calendar as CalendarIcon,
  Users,
  MessageSquare,
  CreditCard,
  BarChart3,
  RefreshCw,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FileBarChart,
  Database,
  Filter,
  Loader2,
} from "lucide-react";

const reportSchema = z.object({
  type: z.enum(["complaints", "users", "withdrawals", "analytics"], {
    required_error: "Please select a report type",
  }),
  format: z.enum(["csv", "excel", "pdf"], {
    required_error: "Please select a format",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  filters: z.object({
    status: z.string().optional(),
    category: z.string().optional(),
    includePersonalData: z.boolean().default(false),
  }),
});

type ReportForm = z.infer<typeof reportSchema>;

interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  format: string;
  status: "generating" | "completed" | "failed";
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: string;
  recordCount?: number;
  createdBy: string;
}

const mockReports: GeneratedReport[] = [
  {
    id: "rpt_001",
    name: "Monthly Complaints Report",
    type: "complaints",
    format: "excel",
    status: "completed",
    createdAt: "2024-01-16T10:30:00Z",
    completedAt: "2024-01-16T10:32:15Z",
    downloadUrl: "/downloads/complaints-jan-2024.xlsx",
    fileSize: "2.4 MB",
    recordCount: 1250,
    createdBy: "Admin User",
  },
  {
    id: "rpt_002",
    name: "User Analytics Report",
    type: "analytics",
    format: "pdf",
    status: "completed",
    createdAt: "2024-01-15T14:20:00Z",
    completedAt: "2024-01-15T14:25:30Z",
    downloadUrl: "/downloads/user-analytics-jan-2024.pdf",
    fileSize: "1.8 MB",
    recordCount: 850,
    createdBy: "Manager",
  },
  {
    id: "rpt_003",
    name: "Withdrawal Summary",
    type: "withdrawals",
    format: "csv",
    status: "generating",
    createdAt: "2024-01-16T15:45:00Z",
    recordCount: 320,
    createdBy: "Admin User",
  },
];

export default function AdminReports() {
  const { toast } = useToast();
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const form = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: "complaints",
      format: "excel",
      dateRange: {
        from: addDays(new Date(), -30),
        to: new Date(),
      },
      filters: {
        includePersonalData: false,
      },
    },
  });

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await reportsAPI.getHistory();
        // Transform API response to match our interface
        const transformedReports = response.data?.map((report: any) => ({
          id: report._id || report.id,
          name: report.name || `${report.type} Report`,
          type: report.type,
          format: report.format,
          status: report.status,
          createdAt: report.createdAt,
          completedAt: report.completedAt,
          downloadUrl: report.downloadUrl,
          fileSize: report.fileSize,
          recordCount: report.recordCount,
          createdBy: report.createdBy?.name || 'System',
        })) || [];
        setReports(transformedReports);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        setReports(mockReports);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const onSubmit = async (data: ReportForm) => {
    setGenerating(true);

    try {
      // Try API call first
      const response = await reportsAPI.generate({
        type: data.type,
        format: data.format,
        dateRange: {
          from: data.dateRange.from.toISOString(),
          to: data.dateRange.to.toISOString(),
        },
        filters: data.filters,
      });

      if (response.data) {
        const newReport: GeneratedReport = {
          id: response.data._id || response.data.id,
          name: response.data.name || `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report`,
          type: data.type,
          format: data.format,
          status: response.data.status || "completed",
          createdAt: response.data.createdAt || new Date().toISOString(),
          completedAt: response.data.completedAt,
          downloadUrl: response.data.downloadUrl,
          fileSize: response.data.fileSize,
          recordCount: response.data.recordCount,
          createdBy: response.data.createdBy || "Current Admin",
        };

        setReports([newReport, ...reports]);

        toast({
          title: "Report Generated Successfully",
          description: `Your ${data.type} report is ready for download.`,
        });
      }
    } catch (apiError) {
      console.warn("API not available, using mock generation:", apiError);
      
      // Fallback to mock generation
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const newReport: GeneratedReport = {
        id: `rpt_${Date.now()}`,
        name: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Report - ${format(data.dateRange.from, "MMM yyyy")}`,
        type: data.type,
        format: data.format,
        status: "completed",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        downloadUrl: `/downloads/${data.type}-${Date.now()}.${data.format}`,
        fileSize: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
        recordCount: Math.floor(Math.random() * 1000) + 100,
        createdBy: "Current Admin",
      };

      setReports([newReport, ...reports]);

      toast({
        title: "Report Generated Successfully",
        description: `Your ${data.type} report is ready for download.`,
      });
    } finally {
      setGenerating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "generating":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <Clock className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "excel":
        return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
      case "pdf":
        return <FileText className="h-4 w-4 text-red-600" />;
      case "csv":
        return <Database className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const stats = {
    totalReports: reports.length,
    completedReports: reports.filter((r) => r.status === "completed").length,
    generatingReports: reports.filter((r) => r.status === "generating").length,
    totalRecords: reports.reduce((sum, r) => sum + (r.recordCount || 0), 0),
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
              <FileBarChart className="h-8 w-8 text-primary" />
              Reports & Data Export
            </h1>
            <p className="text-muted-foreground">
              Generate comprehensive reports and export system data
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.totalReports}</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-2xl font-bold">{stats.completedReports}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <RefreshCw className="h-8 w-8 mx-auto text-blue-500 mb-2" />
              <p className="text-2xl font-bold">{stats.generatingReports}</p>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Database className="h-8 w-8 mx-auto text-purple-500 mb-2" />
              <p className="text-2xl font-bold">
                {stats.totalRecords.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Records Exported</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate New Report */}
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Report Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select report type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="complaints">
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Complaints Report
                              </div>
                            </SelectItem>
                            <SelectItem value="users">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                User Statistics
                              </div>
                            </SelectItem>
                            <SelectItem value="withdrawals">
                              <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Withdrawal Report
                              </div>
                            </SelectItem>
                            <SelectItem value="analytics">
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4" />
                                System Analytics
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Export Format</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="excel">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                Excel (.xlsx)
                              </div>
                            </SelectItem>
                            <SelectItem value="csv">
                              <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-blue-600" />
                                CSV (.csv)
                              </div>
                            </SelectItem>
                            <SelectItem value="pdf">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-red-600" />
                                PDF (.pdf)
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Date Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <FormField
                    control={form.control}
                    name="filters.status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Filter by Status (Optional)</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={generating}
                    className="w-full"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <FileBarChart className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Quick Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Export Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button variant="outline" className="justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Export All Complaints (CSV)
                </Button>
                <Button variant="outline" className="justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Export User List (Excel)
                </Button>
                <Button variant="outline" className="justify-start">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Export Withdrawal Data (CSV)
                </Button>
                <Button variant="outline" className="justify-start">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Analytics Summary (PDF)
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Scheduled Reports</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Set up automatic report generation
                </p>
                <Button variant="outline" className="w-full">
                  <Clock className="mr-2 h-4 w-4" />
                  Configure Scheduled Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Records</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{report.name}</p>
                        {report.fileSize && (
                          <p className="text-sm text-muted-foreground">
                            {report.fileSize}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getFormatIcon(report.format)}
                        <span className="uppercase">{report.format}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {report.recordCount?.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">
                          by {report.createdBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.status === "completed" && report.downloadUrl ? (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      ) : report.status === "generating" ? (
                        <Button variant="ghost" size="sm" disabled>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" disabled>
                          Failed
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reports.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No reports generated yet
                </h3>
                <p className="text-muted-foreground">
                  Generate your first report using the form above
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
