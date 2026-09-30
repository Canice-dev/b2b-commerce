import {
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock3,
  MapPinned,
  MoreHorizontal,
  Package,
  Search,
  ShoppingCart,
  Store,
  Truck,
} from "lucide-react";
import type { ReactNode } from "react";
import { AdminUtilityActions } from "@/components/admin-utility-actions";
import { SignOutButton } from "@/components/sign-out-button";

const metrics = [
  {
    icon: ShoppingCart,
    label: "Orders this week",
    value: "0",
    change: "Ready for pilot orders",
    tone: "text-emerald-600",
  },
  {
    icon: Store,
    label: "Active distributors",
    value: "0",
    change: "Set up your first distributor",
    tone: "text-slate-500",
  },
  {
    icon: Package,
    label: "Products in catalogue",
    value: "0",
    change: "No stock records yet",
    tone: "text-slate-500",
  },
];

const activities = [
  {
    icon: MapPinned,
    title: "Set up your first territory",
    text: "Add a state, LGA, and market to begin routing customers.",
    time: "Next step",
    color: "text-indigo-600 bg-indigo-50 border-indigo-100",
  },
  {
    icon: Truck,
    title: "Create a distributor",
    text: "Add the pilot distributor and its owner contact details.",
    time: "Then",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100",
  },
  {
    icon: Package,
    title: "Load opening stock",
    text: "Create products, prices, and starting quantities.",
    time: "After setup",
    color: "text-amber-600 bg-amber-50 border-amber-100",
  },
];

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

export default function AdminHomePage() {
  return (
    <main className="mx-auto max-w-[1540px] px-4 pb-6 pt-16 sm:px-6 lg:px-8 lg:py-6">
      <div className="relative flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="w-full min-w-0 sm:flex-1">
          <div className="mb-4 flex w-full items-center justify-between gap-3 text-xs text-slate-500">
            <span className="flex min-w-0 items-center gap-2">
              <span>Overview</span>
              <span>/</span>
              <span className="font-medium text-slate-700">Dashboard</span>
            </span>
            <SignOutButton className="absolute right-0 top-0 h-7 shrink-0 border-0 bg-transparent px-2 py-0 text-xs hover:bg-white" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Good morning, Canice <span aria-hidden>👋</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Here is the latest view of your distribution network.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AdminUtilityActions />
          <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <CalendarDays size={15} />
            This week
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
        {metrics.map(({ icon: Icon, label, value, change, tone }) => (
          <section
            className="overflow-hidden rounded-xl border border-slate-200 bg-white"
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
              <p className={`mt-2 text-xs ${tone}`}>{change}</p>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
        <Panel
          icon={ShoppingCart}
          title="Order volume trend"
          action={
            <button className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600">
              <CalendarDays size={14} />
              This week
              <ChevronDown size={13} />
            </button>
          }
        >
          <div className="p-4">
            <div className="flex items-baseline gap-3">
              <p className="text-3xl font-semibold tracking-tight">0</p>
              <p className="text-xs text-slate-500">
                Orders will appear here after launch
              </p>
            </div>
            <div className="mt-6 flex h-44 items-end gap-2 border-b border-slate-100 px-1 pb-0">
              {[28, 44, 34, 58, 42, 69, 52, 44, 60, 36, 49, 31].map(
                (height, index) => (
                  <div
                    className="group flex h-full flex-1 items-end"
                    key={index}
                  >
                    <div
                      className={`w-full rounded-t-md border border-slate-200 bg-linear-to-t from-slate-100 to-slate-50 ${index === 6 ? "border-slate-700 bg-slate-800" : ""}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                ),
              )}
            </div>
            <div className="mt-2 flex justify-between px-1 text-[11px] text-slate-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </Panel>
        <Panel
          icon={CircleAlert}
          title="Setup checklist"
          action={
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
              0 / 3 complete
            </span>
          }
        >
          <div className="divide-y divide-dashed divide-slate-200 px-4">
            {activities.map(({ icon: Icon, title, text, time, color }) => (
              <div className="flex gap-3 py-4" key={title}>
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg border ${color}`}
                >
                  <Icon size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-3">
                    <p className="text-sm font-medium text-slate-800">
                      {title}
                    </p>
                    <span className="whitespace-nowrap text-[11px] text-slate-400">
                      {time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.75fr)]">
        <Panel
          icon={Clock3}
          title="Latest updates"
          action={
            <button aria-label="Updates options" className="text-slate-400">
              <MoreHorizontal size={18} />
            </button>
          }
        >
          <div className="p-4">
            <div className="grid grid-cols-3 gap-2">
              <button className="h-8 rounded-md bg-slate-800 text-xs font-medium text-white">
                Today
              </button>
              <button className="h-8 rounded-md border border-slate-200 text-xs text-slate-600">
                This week
              </button>
              <button className="h-8 rounded-md border border-slate-200 text-xs text-slate-600">
                This month
              </button>
            </div>
            <div className="mt-3 flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-xs text-slate-400">
              <Search size={15} />
              Search activities
            </div>
            <p className="mt-4 text-sm font-medium text-slate-700">
              No activity yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Territory, distributor, stock, and order events will be recorded
              here.
            </p>
          </div>
        </Panel>
        <Panel icon={Bell} title="Network health">
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-600">Territory coverage</span>
                <span className="font-medium text-slate-700">0 markets</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-0 rounded-full bg-emerald-500" />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-600">Catalogue readiness</span>
                <span className="font-medium text-slate-700">0 products</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div className="h-2 w-0 rounded-full bg-indigo-500" />
              </div>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950">
              View setup guide
              <ArrowUpRight size={14} />
            </button>
          </div>
        </Panel>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="panel-heading flex flex-col gap-3 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <ShoppingCart size={16} className="text-slate-500" />
            Recent orders
          </div>
          <div className="flex gap-2">
            <div className="flex h-8 w-40 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-xs text-slate-400">
              <Search size={14} />
              Order ID
            </div>
            <button className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600">
              Filter
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Distributor</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="border-t border-slate-100 px-4 py-9 text-center text-sm text-slate-500"
                  colSpan={6}
                >
                  No orders yet. Customer orders will appear here once the pilot
                  is live.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
