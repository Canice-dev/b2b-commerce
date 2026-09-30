import { Package } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function CataloguePage() {
  return (
    <AdminSectionPage
      action="Add product"
      description="Maintain your product catalogue, pricing, and available stock."
      emptyDescription="Add your first product to make it available for distributor allocation and customer orders."
      emptyTitle="Your catalogue is empty"
      icon={Package}
      label="Catalogue & stock"
      title="Catalogue and stock"
    />
  );
}
