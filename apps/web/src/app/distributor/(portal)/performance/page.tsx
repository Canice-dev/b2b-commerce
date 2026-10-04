import { and, count, eq, gte, sum } from "drizzle-orm";
import { BarChart3, CheckCircle2, ShoppingCart, Truck } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { PortalPage } from "../_components/portal-page";
import { formatNaira, getPortalDistributor } from "../_components/data";

export default async function PerformancePage() {
  const distributor = await getPortalDistributor();
  if (!distributor) return null;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [all, active, delivered, value] = await Promise.all([
    db
      .select({ value: count() })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          gte(orders.createdAt, monthStart),
        ),
      ),
    db
      .select({ value: count() })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          eq(orders.fulfilmentStatus, "out_for_delivery"),
        ),
      ),
    db
      .select({ value: count() })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          eq(orders.fulfilmentStatus, "delivered"),
          gte(orders.deliveredAt, monthStart),
        ),
      ),
    db
      .select({ value: sum(orders.fulfilledTotalKobo) })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          eq(orders.fulfilmentStatus, "delivered"),
          gte(orders.deliveredAt, monthStart),
        ),
      ),
  ]);
  const metrics = [
    {
      label: "Orders received",
      value: String(all[0]?.value ?? 0),
      icon: ShoppingCart,
      detail: "This month",
    },
    {
      label: "Active deliveries",
      value: String(active[0]?.value ?? 0),
      icon: Truck,
      detail: "Currently in transit",
    },
    {
      label: "Orders delivered",
      value: String(delivered[0]?.value ?? 0),
      icon: CheckCircle2,
      detail: "This month",
    },
    {
      label: "Delivered value",
      value: formatNaira(Number(value[0]?.value ?? 0)),
      icon: BarChart3,
      detail: "This month",
    },
  ];
  return (
    <PortalPage
      description="A current view of your distribution performance."
      icon={BarChart3}
      title="Performance"
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ icon: Icon, label, value, detail }) => (
          <section
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            key={label}
          >
            <div className="panel-heading flex h-10 items-center justify-between border-b border-slate-100 px-3">
              <span className="text-xs font-medium text-slate-600">
                {label}
              </span>
              <Icon size={15} className="text-slate-400" />
            </div>
            <div className="p-4">
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                {value}
              </p>
              <p className="mt-2 text-xs text-slate-500">{detail}</p>
            </div>
          </section>
        ))}
      </div>
    </PortalPage>
  );
}
