import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  MapPinned,
  MoreHorizontal,
  Package,
  Search,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { and, count, desc, eq, gte, inArray, sum } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";
import { db } from "@/db";
import { marketDistributorAssignments, markets, orders } from "@/db/schema";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
const statusLabel = (status: string) => status.replaceAll("_", " ");

function Panel({
  children,
  title,
  icon: Icon,
  action,
}: {
  children: ReactNode;
  title: string;
  icon: typeof Package;
  action?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="panel-heading flex h-12 items-center justify-between border-b border-slate-200 px-4">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Icon size={16} className="text-slate-500" />
          {title}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default async function DistributorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session
    ? await getActiveDistributor(session.user.id)
    : null;
  if (!distributor) return null;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [
    awaitingResult,
    enRouteResult,
    deliveredResult,
    valueResult,
    marketResult,
    recentOrders,
    priorityOrders,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          eq(orders.fulfilmentStatus, "confirmed"),
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
    db
      .select({ name: markets.name })
      .from(marketDistributorAssignments)
      .innerJoin(markets, eq(markets.id, marketDistributorAssignments.marketId))
      .where(
        and(
          eq(marketDistributorAssignments.distributorId, distributor.id),
          eq(marketDistributorAssignments.isActive, true),
        ),
      ),
    db
      .select({
        id: orders.id,
        customer: orders.customerBusinessNameSnapshot,
        address: orders.deliveryAddressSnapshot,
        status: orders.fulfilmentStatus,
        totalKobo: orders.orderedTotalKobo,
      })
      .from(orders)
      .where(eq(orders.distributorId, distributor.id))
      .orderBy(desc(orders.createdAt))
      .limit(6),
    db
      .select({
        id: orders.id,
        customer: orders.customerBusinessNameSnapshot,
        address: orders.deliveryAddressSnapshot,
        totalKobo: orders.orderedTotalKobo,
        status: orders.fulfilmentStatus,
      })
      .from(orders)
      .where(
        and(
          eq(orders.distributorId, distributor.id),
          inArray(orders.fulfilmentStatus, ["confirmed", "out_for_delivery"]),
        ),
      )
      .orderBy(desc(orders.createdAt))
      .limit(4),
  ]);
  const awaiting = awaitingResult[0]?.value ?? 0,
    enRoute = enRouteResult[0]?.value ?? 0,
    delivered = deliveredResult[0]?.value ?? 0,
    completedValue = Number(valueResult[0]?.value ?? 0);
  const metrics = [
    {
      icon: ShoppingCart,
      label: "Awaiting fulfilment",
      value: String(awaiting),
      detail: awaiting ? "Orders ready to prepare" : "No orders waiting",
      tone: awaiting ? "text-amber-600" : "text-emerald-600",
      href: "/distributor/orders",
    },
    {
      icon: Truck,
      label: "Out for delivery",
      value: String(enRoute),
      detail: enRoute ? "Orders currently in transit" : "No active deliveries",
      tone: "text-indigo-600",
      href: "/distributor/deliveries",
    },
    {
      icon: CheckCircle2,
      label: "Delivered this month",
      value: String(delivered),
      detail: `${formatNaira(completedValue)} completed value`,
      tone: "text-emerald-600",
      href: "/distributor/performance",
    },
  ];
  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:py-6">
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
            <span>Overview</span>
            <span>/</span>
            <span className="font-medium text-slate-700">Dashboard</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, {distributor.businessName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Keep deliveries moving and your customers informed.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SignOutButton
            redirectTo="/distributor/sign-in"
            className="absolute right-0 top-0 h-7 border-0 bg-transparent px-2 py-0 text-xs hover:bg-white sm:hidden"
          />
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600">
            <CalendarDays size={15} />
            This month
            <ChevronDown size={14} />
          </button>
          <button
            aria-label="More dashboard actions"
            className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {metrics.map(({ icon: Icon, label, value, detail, tone, href }) => (
          <Link
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
            href={href}
            key={label}
          >
            <div className="panel-heading flex h-9 items-center justify-between border-b border-slate-100 px-3">
              <span className="text-xs font-medium text-slate-600">
                {label}
              </span>
              <Icon size={15} className="text-slate-400" />
            </div>
            <div className="m-1 rounded-lg border border-slate-100 px-4 py-5">
              <p className="text-3xl font-semibold tracking-tight text-slate-900">
                {value}
              </p>
              <p className={`mt-2 text-xs ${tone}`}>{detail}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
        <Panel
          icon={Truck}
          title="Delivery priority"
          action={
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
              {priorityOrders.length} active
            </span>
          }
        >
          {priorityOrders.length ? (
            <div className="divide-y divide-dashed divide-slate-200 px-4">
              {priorityOrders.map((order) => (
                <div className="flex items-center gap-3 py-3.5" key={order.id}>
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg border ${order.status === "out_for_delivery" ? "border-indigo-100 bg-indigo-50 text-indigo-600" : "border-amber-100 bg-amber-50 text-amber-600"}`}
                  >
                    <Truck size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">
                      {order.customer}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {order.address}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-slate-700">
                      {formatNaira(order.totalKobo)}
                    </p>
                    <p className="mt-1 text-[11px] capitalize text-slate-400">
                      {statusLabel(order.status)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-sm text-slate-500">
              New orders that need action will appear here.
            </div>
          )}
        </Panel>
        <Panel icon={MapPinned} title="Service coverage">
          <div className="p-4">
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {marketResult.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">Assigned markets</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {marketResult.length ? (
                marketResult.slice(0, 5).map((market) => (
                  <span
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                    key={market.name}
                  >
                    {market.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  No service areas assigned yet.
                </span>
              )}
            </div>
            <Link className="mt-5 inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950" href="/distributor/service-areas">
              View service areas
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </Panel>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
        <Panel
          icon={Clock3}
          title="Fulfilment snapshot"
          action={
            <button aria-label="Snapshot options" className="text-slate-400">
              <MoreHorizontal size={18} />
            </button>
          }
        >
          <div className="p-4">
            <div className="flex items-end gap-2 border-b border-slate-100 pb-4">
              <div className="flex-1">
                <p className="text-2xl font-semibold tracking-tight text-slate-900">
                  {awaiting + enRoute + delivered}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Orders handled this month
                </p>
              </div>
              <div className="flex h-24 flex-1 items-end gap-2">
                {[32, 50, 37, 64, 45, 80, 58].map((height, index) => (
                  <div className="flex flex-1 items-end" key={index}>
                    <div
                      className={`w-full rounded-t-md ${index === 5 ? "bg-slate-800" : "bg-slate-200"}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                [awaiting, "To prepare"],
                [enRoute, "In transit"],
                [delivered, "Delivered"],
              ].map(([value, label]) => (
                <div key={String(label)}>
                  <p className="text-sm font-semibold text-slate-800">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </Panel>
        <Panel icon={CircleAlert} title="Today’s focus">
          <div className="divide-y divide-dashed divide-slate-200 px-4">
            <div className="py-4">
              <p className="text-sm font-medium text-slate-800">
                Prepare confirmed orders
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {awaiting
                  ? `${awaiting} order${awaiting === 1 ? "" : "s"} need fulfilment attention.`
                  : "Your order queue is clear."}
              </p>
            </div>
            <div className="py-4">
              <p className="text-sm font-medium text-slate-800">
                Monitor active deliveries
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {enRoute
                  ? `${enRoute} delivery${enRoute === 1 ? " is" : "ies are"} currently in transit.`
                  : "No deliveries are currently in transit."}
              </p>
            </div>
          </div>
        </Panel>
      </div>
      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="panel-heading flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShoppingCart size={16} className="text-slate-500" />
            Recent orders
          </div>
          <div className="flex h-8 w-44 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-400">
            <Search size={14} />
            Search order
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Delivery address</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length ? (
                recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border-t border-slate-100 px-4 py-3 font-mono text-xs text-slate-600">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-700">
                      {order.customer}
                    </td>
                    <td className="max-w-70 truncate border-t border-slate-100 px-4 py-3 text-slate-600">
                      {order.address}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 capitalize text-slate-600">
                      {statusLabel(order.status)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-right font-medium text-slate-800">
                      {formatNaira(order.totalKobo)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-t border-slate-100 px-4 py-9 text-center text-sm text-slate-500"
                    colSpan={5}
                  >
                    No orders yet. New customer orders will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
