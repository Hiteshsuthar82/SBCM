import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart as RechartsAreaChart,
  Area,
} from "recharts";

// Note: React warnings about defaultProps from XAxis/YAxis are from the recharts library itself
// and will be resolved when the library updates to use JavaScript default parameters.
// These warnings don't affect functionality and can be safely ignored.

interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  className?: string;
}

// Color palette for charts
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
];

export function ComplaintStatusChart({ title, data, className }: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ComplaintTrendsChart({ title, data, className }: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsLineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="submitted"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Submitted"
            />
            <Line
              type="monotone"
              dataKey="approved"
              stroke="#10B981"
              strokeWidth={2}
              name="Approved"
            />
            <Line
              type="monotone"
              dataKey="rejected"
              stroke="#EF4444"
              strokeWidth={2}
              name="Rejected"
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ComplaintTypesChart({ title, data, className }: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function UserActivityChart({ title, data, className }: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsAreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="users"
              stackId="1"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="active"
              stackId="1"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function PerformanceMetricsChart({
  title,
  data,
  className,
}: ChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RechartsBarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip />
            <Bar dataKey="value" fill="#10B981" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Mock data generators for testing
export const generateComplaintStatusData = () => [
  { name: "Pending", value: 45 },
  { name: "Under Review", value: 30 },
  { name: "Approved", value: 80 },
  { name: "Rejected", value: 25 },
];

export const generateComplaintTrendsData = () => [
  { name: "Jan", submitted: 65, approved: 45, rejected: 15 },
  { name: "Feb", submitted: 78, approved: 52, rejected: 18 },
  { name: "Mar", submitted: 90, approved: 68, rejected: 12 },
  { name: "Apr", submitted: 85, approved: 71, rejected: 8 },
  { name: "May", submitted: 95, approved: 78, rejected: 10 },
  { name: "Jun", submitted: 110, approved: 89, rejected: 12 },
];

export const generateComplaintTypesData = () => [
  { name: "Bus Delay", value: 35 },
  { name: "Cleanliness", value: 28 },
  { name: "Staff Behavior", value: 22 },
  { name: "Overcrowding", value: 18 },
  { name: "Safety", value: 15 },
  { name: "Technical", value: 12 },
  { name: "Other", value: 8 },
];

export const generateUserActivityData = () => [
  { name: "Jan", users: 120, active: 80 },
  { name: "Feb", users: 145, active: 95 },
  { name: "Mar", users: 180, active: 125 },
  { name: "Apr", users: 210, active: 150 },
  { name: "May", users: 245, active: 180 },
  { name: "Jun", users: 280, active: 220 },
];

export const generatePerformanceMetricsData = () => [
  { name: "Response Time", value: 4.2 },
  { name: "Resolution Rate", value: 87 },
  { name: "User Satisfaction", value: 92 },
  { name: "Admin Efficiency", value: 78 },
];

// Generic chart component interfaces
interface GenericChartProps {
  data: any[];
  width?: string | number;
  height?: string | number;
  dataKeys?: Array<{
    key: string;
    color: string;
    name: string;
  }>;
  showTooltip?: boolean;
  showLegend?: boolean;
}

// Generic PieChart component
export function PieChart({
  data,
  width = "100%",
  height = 300,
  showTooltip = true,
  showLegend = false,
}: GenericChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.fill || COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}

// Generic LineChart component
export function LineChart({
  data,
  width = "100%",
  height = 300,
  dataKeys = [{ key: "value", color: "#3B82F6", name: "Value" }],
  showTooltip = true,
  showLegend = false,
}: GenericChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((dataKey, index) => (
          <Line
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            stroke={dataKey.color}
            strokeWidth={2}
            name={dataKey.name}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

// Generic BarChart component
export function BarChart({
  data,
  width = "100%",
  height = 300,
  dataKeys = [{ key: "value", color: "#3B82F6", name: "Value" }],
  showTooltip = true,
  showLegend = false,
}: GenericChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((dataKey, index) => (
          <Bar
            key={dataKey.key}
            dataKey={dataKey.key}
            fill={dataKey.color}
            name={dataKey.name}
          />
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

// Generic AreaChart component
export function AreaChart({
  data,
  width = "100%",
  height = 300,
  dataKeys = [{ key: "value", color: "#3B82F6", name: "Value" }],
  showTooltip = true,
  showLegend = false,
}: GenericChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        {showTooltip && <Tooltip />}
        {showLegend && <Legend />}
        {dataKeys.map((dataKey, index) => (
          <Area
            key={dataKey.key}
            type="monotone"
            dataKey={dataKey.key}
            stackId="1"
            stroke={dataKey.color}
            fill={dataKey.color}
            fillOpacity={0.6}
            name={dataKey.name}
          />
        ))}
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
}
