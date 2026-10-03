import { count } from "drizzle-orm";
import { Settings2 } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import { distributorProfiles, markets, states } from "@/db/schema";

export default async function SettingsPage() {
  const [stateCount, marketCount, distributorCount] = await Promise.all([
    db.select({ value: count() }).from(states),
    db.select({ value: count() }).from(markets),
    db.select({ value: count() }).from(distributorProfiles),
  ]);
  const items = [
    { label: "States configured", value: stateCount[0]?.value ?? 0 },
    { label: "Markets configured", value: marketCount[0]?.value ?? 0 },
    { label: "Distributor accounts", value: distributorCount[0]?.value ?? 0 },
  ];
  return (
    <AdminPageShell
      action="Configure settings"
      description="Manage company preferences and operational defaults."
      icon={Settings2}
      label="Settings"
      title="Administration settings"
    >
      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.65fr)]">
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-sm font-medium text-slate-700">
              Network configuration
            </p>
            <p className="mt-1 text-xs text-slate-500">
              The current setup discovered from your database.
            </p>
          </div>
          <dl className="divide-y divide-slate-100">
            {items.map((item) => (
              <div
                className="flex items-center justify-between px-4 py-4"
                key={item.label}
              >
                <dt className="text-sm text-slate-600">{item.label}</dt>
                <dd className="text-lg font-semibold text-slate-800">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
          <p className="text-sm font-semibold text-indigo-900">
            Demo environment
          </p>
          <p className="mt-2 text-sm leading-6 text-indigo-800">
            The seed script creates markets and distributor dashboard accounts.
            Configuration controls will be added with the management workflow.
          </p>
        </section>
      </div>
    </AdminPageShell>
  );
}
