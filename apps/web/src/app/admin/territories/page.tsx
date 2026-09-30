import { MapPinned } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function TerritoriesPage() {
  return (
    <AdminSectionPage
      action="Add territory"
      description="Define the markets and service areas your network supports."
      emptyDescription="Add a state, LGA, or market to begin assigning distributors and routing orders."
      emptyTitle="No territories yet"
      icon={MapPinned}
      label="Territories"
      title="Territory coverage"
    />
  );
}
