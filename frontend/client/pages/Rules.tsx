import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  BookOpen,
  Users,
  Bus,
  Shield,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { rulesAPI } from "@/lib/services/api";

interface Rule {
  id: string;
  category: string;
  title: string;
  description: string;
  importance: "high" | "medium" | "low";
  createdAt: string;
  updatedAt: string;
}

const mockRules: Rule[] = [
  {
    id: "1",
    category: "Passenger Conduct",
    title: "Ticket Purchase Mandatory",
    description:
      "All passengers must purchase a valid ticket before boarding the bus. Traveling without a ticket is strictly prohibited and may result in penalties.",
    importance: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "2",
    category: "Passenger Conduct",
    title: "Priority Seating",
    description:
      "Seats marked for senior citizens, pregnant women, and differently-abled passengers must be vacated upon request. It is mandatory to offer these seats to those who need them.",
    importance: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "3",
    category: "Passenger Conduct",
    title: "No Smoking or Alcohol",
    description:
      "Smoking, consuming alcohol, or carrying intoxicating substances inside the bus is strictly forbidden. Violators will be removed from the bus and may face legal action.",
    importance: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "4",
    category: "Passenger Conduct",
    title: "Maintain Cleanliness",
    description:
      "Keep the bus clean by not littering, spitting, or disposing of waste inside the vehicle. Use dustbins provided at bus stops.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "5",
    category: "Safety Guidelines",
    title: "Emergency Exits",
    description:
      "Familiarize yourself with emergency exit locations. Do not block emergency exits with luggage or personal belongings. In case of emergency, follow driver instructions calmly.",
    importance: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "6",
    category: "Safety Guidelines",
    title: "Boarding and Alighting",
    description:
      "Board and alight the bus only when it comes to a complete stop. Use designated doors and wait for passengers to exit before boarding.",
    importance: "high",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "7",
    category: "Safety Guidelines",
    title: "Hold Handrails",
    description:
      "Always hold handrails or support bars while the bus is in motion. Avoid standing near doors during transit.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "8",
    category: "Luggage & Belongings",
    title: "Luggage Size Restrictions",
    description:
      "Large luggage items that block aisles or inconvenience other passengers are not allowed. Small bags should be kept on your lap or under the seat.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "9",
    category: "Luggage & Belongings",
    title: "Valuable Items",
    description:
      "Keep valuable items secure and under personal supervision. BRTS is not responsible for lost or stolen personal belongings.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "10",
    category: "Payment & Tickets",
    title: "Digital Payment Accepted",
    description:
      "BRTS accepts cash, UPI, credit/debit cards, and mobile wallets for ticket purchases. Keep your payment receipt until you reach your destination.",
    importance: "low",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "11",
    category: "Payment & Tickets",
    title: "Ticket Validation",
    description:
      "Validate your ticket immediately after purchase if using a card-based system. Invalid or expired tickets are not accepted.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "12",
    category: "Complaint System",
    title: "Reporting Issues",
    description:
      "Passengers are encouraged to report service issues, safety concerns, or staff misconduct through the SBCMS app or at customer service centers.",
    importance: "medium",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "13",
    category: "Complaint System",
    title: "Reward Points",
    description:
      "Verified complaints that help improve services earn reward points. Points can be redeemed for various benefits and cash rewards.",
    importance: "low",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

const categoryIcons: Record<string, any> = {
  "Passenger Conduct": Users,
  "Safety Guidelines": Shield,
  "Luggage & Belongings": Bus,
  "Payment & Tickets": DollarSign,
  "Complaint System": BookOpen,
};

const importanceColors = {
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  medium:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export default function Rules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const loadRules = async () => {
      setLoading(true);
      try {
        const response = await rulesAPI.getAll();
        // Transform API response to match our interface
        const transformedRules = response.data?.map((rule: any) => ({
          id: rule._id || rule.id,
          category: rule.category,
          title: rule.title || rule.category, // Use category as title if no title
          description: rule.description,
          importance: rule.importance || "medium",
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        })) || [];
        setRules(transformedRules);
      } catch (error) {
        console.warn("API not available, using mock data:", error);
        // Fallback to mock data
        setRules(mockRules);
      } finally {
        setLoading(false);
      }
    };

    loadRules();
  }, []);

  const categories = Array.from(
    new Set(rules.map((rule) => rule.category)),
  ).sort();

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            BRTS Rules & Guidelines
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Please read and follow these rules to ensure a safe, comfortable,
            and pleasant journey for all passengers
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || BookOpen;
            const categoryRules = rules.filter(
              (rule) => rule.category === category,
            );
            return (
              <Card key={category} className="text-center">
                <CardContent className="p-4">
                  <Icon className="h-8 w-8 mx-auto text-primary mb-2" />
                  <h3 className="font-semibold text-sm mb-1">{category}</h3>
                  <p className="text-2xl font-bold">{categoryRules.length}</p>
                  <p className="text-xs text-muted-foreground">Rules</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules and guidelines..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="w-full lg:w-auto"
              >
                <TabsList className="grid grid-cols-3 lg:grid-cols-6 h-auto">
                  <TabsTrigger value="all" className="text-xs">
                    All
                  </TabsTrigger>
                  {categories.slice(0, 5).map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="text-xs"
                    >
                      {category.split(" ")[0]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Rules Content */}
        {filteredRules.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(rulesByCategory).map(
              ([category, categoryRules]) => {
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
                      <Accordion type="multiple" className="w-full">
                        {categoryRules.map((rule, index) => (
                          <AccordionItem key={rule.id} value={rule.id}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="flex items-center gap-2">
                                  {rule.importance === "high" && (
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                  )}
                                  {rule.importance === "medium" && (
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {rule.importance === "low" && (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  <span className="font-medium">
                                    {rule.title}
                                  </span>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className={importanceColors[rule.importance]}
                                >
                                  {rule.importance}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-4 space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                  {rule.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                                  <span>
                                    Last updated:{" "}
                                    {new Date(
                                      rule.updatedAt,
                                    ).toLocaleDateString()}
                                  </span>
                                  <span>Rule #{rule.id}</span>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No rules found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm
                  ? "No rules match your search criteria"
                  : "No rules available for the selected category"}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 mt-1" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  Important Notice
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm">
                  These rules are designed for the safety and comfort of all
                  passengers. Violations may result in penalties, removal from
                  the bus, or legal action. If you witness any violations or
                  have safety concerns, please report them through the SBCMS
                  complaint system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
