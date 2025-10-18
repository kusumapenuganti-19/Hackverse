import { useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SpendTimelineProps {
  timeSeriesData: Array<{
    date: string;
    food: number;
    bus: number;
    total: number;
  }>;
  groupBy: "day" | "week" | "month";
  onGroupByChange: (groupBy: "day" | "week" | "month") => void;
}

export default function SpendTimeline({
  timeSeriesData,
  groupBy,
  onGroupByChange,
}: SpendTimelineProps) {
  const [chartType, setChartType] = useState<"line" | "area">("area");

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (groupBy === "day") {
      return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
    } else if (groupBy === "week") {
      return `Week of ${date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
    } else {
      return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-2">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base">Spending Timeline</CardTitle>
            <div className="flex gap-2">
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={groupBy === "day" ? "default" : "ghost"}
                  onClick={() => onGroupByChange("day")}
                  className="h-7 text-xs"
                >
                  Daily
                </Button>
                <Button
                  size="sm"
                  variant={groupBy === "week" ? "default" : "ghost"}
                  onClick={() => onGroupByChange("week")}
                  className="h-7 text-xs"
                >
                  Weekly
                </Button>
                <Button
                  size="sm"
                  variant={groupBy === "month" ? "default" : "ghost"}
                  onClick={() => onGroupByChange("month")}
                  className="h-7 text-xs"
                >
                  Monthly
                </Button>
              </div>
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={chartType === "area" ? "default" : "ghost"}
                  onClick={() => setChartType("area")}
                  className="h-7 text-xs"
                >
                  Area
                </Button>
                <Button
                  size="sm"
                  variant={chartType === "line" ? "default" : "ghost"}
                  onClick={() => setChartType("line")}
                  className="h-7 text-xs"
                >
                  Line
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            {chartType === "area" ? (
              <AreaChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="food"
                  name="Food"
                  stroke="#f97316"
                  fillOpacity={1}
                  fill="url(#colorFood)"
                />
                <Area
                  type="monotone"
                  dataKey="bus"
                  name="Bus"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorBus)"
                />
              </AreaChart>
            ) : (
              <LineChart data={timeSeriesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="food"
                  name="Food"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316" }}
                />
                <Line
                  type="monotone"
                  dataKey="bus"
                  name="Bus"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
