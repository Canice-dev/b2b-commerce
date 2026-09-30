import { Settings2 } from "lucide-react";
import { AdminSectionPage } from "@/components/admin-section-page";

export default function SettingsPage() {
  return (
    <AdminSectionPage
      action="Configure settings"
      description="Manage company preferences and operational defaults."
      emptyDescription="Set up the preferences that keep your distribution network aligned as it grows."
      emptyTitle="Company settings"
      icon={Settings2}
      label="Settings"
      title="Administration settings"
    />
  );
}
