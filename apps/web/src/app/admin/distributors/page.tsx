import { Truck } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function DistributorsPage() {
  return (
    <AdminSectionPage
      action="Add distributor"
      description="Manage the partners responsible for stock and fulfilment."
      emptyDescription="Create your first distributor to start assigning territories, products, and orders."
      emptyTitle="No distributors yet"
      icon={Truck}
      label="Distributors"
      title="Distributor network"
    />
  );
}
