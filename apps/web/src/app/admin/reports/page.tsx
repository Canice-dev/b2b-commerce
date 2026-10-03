import { count, eq, sql } from "drizzle-orm";
import {
  BarChart3,
  MapPinned,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import { distributorProfiles, markets, orders, products } from "@/db/schema";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function ReportsPage() {
  const [distributorCount, marketCount, productCount, orderStats] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(distributorProfiles)
        .where(eq(distributorProfiles.isActive, true)),
      db.select({ value: count() }).from(markets),
      db
        .select({ value: count() })
        .from(products)
        .where(eq(products.isActive, true)),
      db
        .select({
          count: count(),
          total: sql<number>`coalesce(sum(${orders.orderedTotalKobo}), 0)`,
        })
        .from(orders),
    ]);
  const cards = [
    {
      icon: Store,
      label: "Active distributors",
      value: distributorCount[0]?.value ?? 0,
      tone: "text-emerald-700 bg-emerald-50",
    },
    {
      icon: MapPinned,
      label: "Markets covered",
      value: marketCount[0]?.value ?? 0,
      tone: "text-indigo-700 bg-indigo-50",
    },
    {
      icon: Package,
      label: "Active products",
      value: productCount[0]?.value ?? 0,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      icon: ShoppingCart,
      label: "Orders received",
      value: orderStats[0]?.count ?? 0,
      tone: "text-sky-700 bg-sky-50",
    },
  ];
  return (
    <AdminPageShell
      action="Export report"
      description="Review performance across sales, stock, territories, and distributors."
      icon={BarChart3}
      label="Reports"
      title="Performance reports"
    >
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, tone }) => (
          <section
            className="rounded-xl border border-slate-200 bg-white p-4"
            key={label}
          >
            <span
              className={`grid size-8 place-items-center rounded-lg ${tone}`}
            >
              <Icon size={16} />
            </span>
            <p className="mt-4 text-2xl font-semibold text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{label}</p>
          </section>
        ))}
      </div>
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-medium text-slate-700">Sales performance</p>
        <p className="mt-1 text-sm text-slate-500">
          Total value of all recorded orders.
        </p>
        <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
          {formatNaira(orderStats[0]?.total ?? 0)}
        </p>
      </section>
    </AdminPageShell>
  );
}
