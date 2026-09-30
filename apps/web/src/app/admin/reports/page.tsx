import { BarChart3 } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function ReportsPage() {
  return <AdminSectionPage action="Create report" description="Review performance across sales, stock, territories, and distributors." emptyDescription="Reports will become available as activity is recorded across your distribution network." emptyTitle="No reports to show" icon={BarChart3} label="Reports" title="Performance reports" />;
}
