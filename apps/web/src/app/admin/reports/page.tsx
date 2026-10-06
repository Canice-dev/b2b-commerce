import { and, count, eq, gte, lt } from "drizzle-orm";
import {
  BarChart3,
  MapPinned,
  Package,
  ShoppingCart,
  Store,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { AdminDashboardPeriodSelect } from "@/components/admin-dashboard-period-select";
import { AdminSalesTrendChart } from "@/components/admin-sales-trend-chart";
import { db } from "@/db";
import { distributorProfiles, markets, orders, products } from "@/db/schema";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const period = range === "month" || range === "year" ? range : "week";
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7));
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const rangeStart =
    period === "week" ? weekStart : period === "month" ? monthStart : yearStart;
  const rangeEnd =
    period === "year"
      ? new Date(today.getFullYear() + 1, 0, 1)
      : period === "month"
        ? new Date(today.getFullYear(), today.getMonth() + 1, 1)
        : (() => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + 7);
            return date;
          })();
  const [distributorCount, marketCount, productCount, periodOrders] =
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
        .select({ createdAt: orders.createdAt, total: orders.orderedTotalKobo })
        .from(orders)
        .where(
          and(
            gte(orders.createdAt, rangeStart),
            lt(orders.createdAt, rangeEnd),
          ),
        ),
    ]);
  const orderCount = periodOrders.length;
  const salesTotal = periodOrders.reduce(
    (total, order) => total + order.total,
    0,
  );
  const points =
    period === "year"
      ? Array.from(
          { length: 12 },
          (_, index) => new Date(today.getFullYear(), index, 1),
        )
      : period === "month"
        ? Array.from(
            {
              length: new Date(
                today.getFullYear(),
                today.getMonth() + 1,
                0,
              ).getDate(),
            },
            (_, index) =>
              new Date(today.getFullYear(), today.getMonth(), index + 1),
          )
        : Array.from({ length: 7 }, (_, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            return date;
          });
  const salesTrend = points.map((date) => {
    const nextDate =
      period === "year"
        ? new Date(date.getFullYear(), date.getMonth() + 1, 1)
        : new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    return {
      label:
        period === "year"
          ? new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date)
          : period === "week"
            ? new Intl.DateTimeFormat("en-NG", { weekday: "short" }).format(
                date,
              )
            : `${new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date)} ${date.getDate()}`,
      date: new Intl.DateTimeFormat("en-NG", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date),
      sales: periodOrders
        .filter(
          (order) => order.createdAt >= date && order.createdAt < nextDate,
        )
        .reduce((total, order) => total + order.total, 0),
    };
  });
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
      value: orderCount,
      tone: "text-sky-700 bg-sky-50",
    },
  ];
  return (
    <AdminPageShell
      action="Export report"
      actionSlot={<AdminDashboardPeriodSelect value={period} />}
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
          Total value of orders received this {period}.
        </p>
        <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
          {formatNaira(salesTotal)}
        </p>
      </section>
      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-5">
          <p className="text-sm font-medium text-slate-700">Sales trend</p>
          <p className="mt-1 text-sm text-slate-500">
            Order value over the selected period.
          </p>
        </div>
        <AdminSalesTrendChart data={salesTrend} period={period} />
      </section>
    </AdminPageShell>
  );
}
