import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Truck, Tag, Gift } from "lucide-react";
import MenuItemCard from "./MenuItemCard";

interface RestaurantCardProps {
  restaurantData: any;
  isNewUser: boolean;
  onAddToCart: (item: any, restaurantData: any) => void;
}

export default function RestaurantCard({ restaurantData, isNewUser, onAddToCart }: RestaurantCardProps) {
  return (
    <Card className="food-card p-5 border-2 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-base font-bold text-foreground">{restaurantData.restaurant}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">{restaurantData.platform}</p>
          </div>
          <div className="flex gap-2">
            <Badge className="food-badge text-xs px-2 py-1">⭐ {restaurantData.rating}</Badge>
            <Badge variant="secondary" className="text-xs px-2 py-1">🕐 {restaurantData.eta}m</Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {restaurantData.freeDeliveryAbove && (
            <Badge className="bg-green-600 text-white text-xs px-2 py-1">
              <Truck className="h-3 w-3 mr-1" />
              Free delivery ₹{restaurantData.freeDeliveryAbove}+
            </Badge>
          )}
          {isNewUser && restaurantData.newUserDiscount > 0 && (
            <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
              <Gift className="h-3 w-3 mr-1" />
              ₹{restaurantData.newUserDiscount} OFF for new users
            </Badge>
          )}
          {restaurantData.minOrderDiscount && (
            <Badge className="bg-purple-600 text-white text-xs px-2 py-1">
              <Tag className="h-3 w-3 mr-1" />
              {restaurantData.minOrderDiscount.discount}% off on ₹{restaurantData.minOrderDiscount.minOrder}+
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {restaurantData.availableItems.map((item: any, itemIdx: number) => (
          <MenuItemCard
            key={itemIdx}
            item={item}
            onAdd={() => onAddToCart(item, restaurantData)}
          />
        ))}
      </div>
    </Card>
  );
}
