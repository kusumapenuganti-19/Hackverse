import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Bus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SpendOverviewProps {
  totalSpend: number;
  dailyAverage: number;
  totalBookings: number;
  totalSavings: number;
  savingsPercentage: number;
  foodSpend: number;
  busSpend: number;
}

export default function SpendOverview({
  totalSpend,
  dailyAverage,
  totalBookings,
  totalSavings,
  savingsPercentage,
  foodSpend,
  busSpend,
}: SpendOverviewProps) {
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  };

  const cards = [
    {
      title: "Total Monthly Spend",
      value: formatCurrency(totalSpend),
      icon: DollarSign,
      gradient: "from-blue-500 to-cyan-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Daily Average",
      value: formatCurrency(dailyAverage),
      icon: TrendingUp,
      gradient: "from-purple-500 to-pink-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
    },
    {
      title: "Total Savings",
      value: formatCurrency(totalSavings),
      subtitle: `${savingsPercentage.toFixed(1)}% saved`,
      icon: Sparkles,
      gradient: "from-green-500 to-emerald-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Total Bookings",
      value: totalBookings.toString(),
      icon: ShoppingBag,
      gradient: "from-orange-500 to-red-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`p-4 ${card.bgColor} border-none`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {card.title}
                  </p>
                  <p className={`text-2xl font-bold ${card.textColor}`}>
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subtitle}
                    </p>
                  )}
                </div>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 bg-orange-50 dark:bg-orange-950/20 border-none">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Food Delivery</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(foodSpend)}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-none">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Bus Travel</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(busSpend)}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
