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
import { pointsAPI } from "@/lib/services/api";
import {
  Search,
  Coins,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  Award,
  FileText,
  Users,
  RefreshCw,
  Download,
} from "lucide-react";

interface PointTransaction {
  id: string;
  date: string;
  action: string;
  points: number;
  type: "earned" | "spent" | "bonus";
  description: string;
  complaintId?: string;
  referralId?: string;
  source: string;
}

export default function PointsHistory() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    const loadPointsHistory = async () => {
      setLoading(true);
      try {
        const response = await pointsAPI.getUserHistory();
        // Transform API response to match our interface
        const transformedTransactions = response.data?.map((transaction: any) => ({
          id: transaction._id || transaction.id,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          relatedComplaint: transaction.relatedComplaint,
          date: transaction.date || transaction.createdAt,
        })) || [];
        setTransactions(transformedTransactions);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        const mockTransactions: PointTransaction[] = [
        {
          id: "1",
          date: "2024-01-15T14:30:00Z",
          action: "Complaint Submission",
          points: 10,
          type: "earned",
          description: "Filed complaint about bus delay on Route 15",
          complaintId: "CMP001",
          source: "Complaint System",
        },
        {
          id: "2",
          date: "2024-01-15T16:45:00Z",
          action: "Complaint Approved",
          points: 50,
          type: "earned",
          description: "Your complaint was approved and resolved",
          complaintId: "CMP001",
          source: "Complaint System",
        },
        {
          id: "3",
          date: "2024-01-14T10:20:00Z",
          action: "Referral Bonus",
          points: 25,
          type: "bonus",
          description: "Friend joined through your referral link",
          referralId: "REF001",
          source: "Referral Program",
        },
        {
          id: "4",
          date: "2024-01-13T09:15:00Z",
          action: "Profile Completion",
          points: 20,
          type: "bonus",
          description: "Completed your profile information",
          source: "Profile System",
        },
        {
          id: "5",
          date: "2024-01-12T15:30:00Z",
          action: "Withdrawal",
          points: -100,
          type: "spent",
          description: "Withdrew points for cash reward",
          source: "Withdrawal System",
        },
        {
          id: "6",
          date: "2024-01-11T11:45:00Z",
          action: "Daily Login Bonus",
          points: 5,
          type: "bonus",
          description: "Logged in for 7 consecutive days",
          source: "Login System",
        },
        {
          id: "7",
          date: "2024-01-10T13:20:00Z",
          action: "Complaint Submission",
          points: 10,
          type: "earned",
          description: "Filed complaint about overcrowding on Route 8",
          complaintId: "CMP002",
          source: "Complaint System",
        },
        {
          id: "8",
          date: "2024-01-09T16:10:00Z",
          action: "Survey Completion",
          points: 15,
          type: "earned",
          description: "Completed monthly service feedback survey",
          source: "Survey System",
        },
      ];

        setTransactions(mockTransactions);
      } finally {
        setLoading(false);
      }
    };

    loadPointsHistory();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      transaction.source.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    const matchesDate =
      !dateRange.from ||
      !dateRange.to ||
      (new Date(transaction.date) >= dateRange.from &&
        new Date(transaction.date) <= dateRange.to);

    return matchesSearch && matchesType && matchesDate;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "earned":
        return <Plus className="h-4 w-4 text-green-500" />;
      case "spent":
        return <Minus className="h-4 w-4 text-red-500" />;
      case "bonus":
        return <Award className="h-4 w-4 text-blue-500" />;
      default:
        return <Coins className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "earned":
        return "bg-green-100 text-green-800";
      case "spent":
        return "bg-red-100 text-red-800";
      case "bonus":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalEarned = transactions
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);

  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + t.points, 0),
  );

  const currentBalance = transactions.reduce((sum, t) => sum + t.points, 0);

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
              <Coins className="h-8 w-8 text-primary" />
              Points History
            </h1>
            <p className="text-muted-foreground">
              Track all your point transactions and rewards
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-6 w-6 text-primary mr-2" />
                <span className="text-sm font-medium">Current Balance</span>
              </div>
              <p className="text-2xl font-bold">{currentBalance}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-sm font-medium">Total Earned</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{totalEarned}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-sm font-medium">Total Spent</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{totalSpent}</p>
              <p className="text-sm text-muted-foreground">points</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <p className="text-2xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground">total</p>
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
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="earned">Earned</SelectItem>
                    <SelectItem value="spent">Spent</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40">
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

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Transaction History ({filteredTransactions.length} of{" "}
              {transactions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(transaction.date).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">
                          {new Date(transaction.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(transaction.type)}
                        <span className="font-medium">
                          {transaction.action}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div
                        className={`font-bold ${
                          transaction.points > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.points > 0 ? "+" : ""}
                        {transaction.points}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <Badge variant="outline">{transaction.source}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm">{transaction.description}</p>
                      {transaction.complaintId && (
                        <p className="text-xs text-muted-foreground">
                          Complaint: {transaction.complaintId}
                        </p>
                      )}
                      {transaction.referralId && (
                        <p className="text-xs text-muted-foreground">
                          Referral: {transaction.referralId}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8">
                <Coins className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No transactions found
                </h3>
                <p className="text-muted-foreground">
                  No transactions match your current filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
