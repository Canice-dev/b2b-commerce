import { ShoppingCart } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function OrdersPage() {
  return (
    <AdminSectionPage
      action="Create order"
      description="Monitor customer orders from placement through delivery."
      emptyDescription="Orders will appear here once customers begin placing them through your distribution network."
      emptyTitle="No orders yet"
      icon={ShoppingCart}
      label="Orders"
      title="Order management"
    />
  );
}
