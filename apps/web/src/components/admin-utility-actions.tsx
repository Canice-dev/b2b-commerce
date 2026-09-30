import Link from "next/link";
import { Bell, Settings2 } from "lucide-react";

export function AdminUtilityActions() {
  return (
    <div className="flex items-center gap-1">
      <button
        aria-label="Notifications"
        className="grid size-8 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-800"
        type="button"
      >
        <Bell size={16} strokeWidth={1.7} />
      </button>
      <Link
        aria-label="Settings"
        className="grid size-8 place-items-center rounded-md text-slate-500 transition hover:bg-white hover:text-slate-800"
        href="/admin/settings"
      >
        <Settings2 size={16} strokeWidth={1.7} />
      </Link>
    </div>
  );
}
