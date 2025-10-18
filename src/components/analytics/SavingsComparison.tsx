import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingDown } from "lucide-react";

interface SavingsComparisonProps {
  totalWithoutRaayan: number;
  totalWithRaayan: number;
  totalSavings: number;
  savingsPercentage: number;
}

export default function SavingsComparison({
  totalWithoutRaayan,
  totalWithRaayan,
  totalSavings,
  savingsPercentage,
}: SavingsComparisonProps) {
  const data = [
    {
      name: "Without Raayan",
      amount: totalWithoutRaayan,
      color: "#ef4444",
    },
    {
      name: "With Raayan",
      amount: totalWithRaayan,
      color: "#22c55e",
    },
  ];

  const formatCurrency = (value: number) => {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold">{payload[0].payload.name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            {formatCurrency(payload[0].value)}
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
      transition={{ delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Savings Comparison</CardTitle>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-950/20 rounded-full">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                {savingsPercentage.toFixed(1)}% saved
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Total Savings</p>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalSavings)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              You saved this much by using Raayan! 🎉
            </p>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
