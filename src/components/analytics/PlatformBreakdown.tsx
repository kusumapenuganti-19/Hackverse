import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlatformBreakdownProps {
  platformData: Array<{
    platform: string;
    spend: number;
    count: number;
  }>;
}

export default function PlatformBreakdown({ platformData }: PlatformBreakdownProps) {
  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const platformColors: Record<string, string> = {
    Swiggy: "#fc8019",
    Zomato: "#e23744",
    RedBus: "#d84e55",
    AbhiBus: "#3b82f6",
    MakeMyTrip: "#0084ff",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold mb-1">{payload[0].payload.platform}</p>
          <p className="text-sm text-muted-foreground">
            Spend: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-muted-foreground">
            Bookings: {payload[0].payload.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={platformData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <YAxis dataKey="platform" type="category" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="spend" radius={[0, 8, 8, 0]}>
                {platformData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={platformColors[entry.platform] || "#8b5cf6"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {platformData.map((platform) => (
              <div
                key={platform.platform}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: platformColors[platform.platform] || "#8b5cf6" }}
                  />
                  <span className="text-sm font-medium">{platform.platform}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {platform.count} bookings
                  </Badge>
                  <span className="text-sm font-semibold">{formatCurrency(platform.spend)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
