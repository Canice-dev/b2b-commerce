import {
  ArrowUpRight,
  Bell,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  MoreHorizontal,
  Package,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import { AdminUtilityActions } from "@/components/admin-utility-actions";
import { AdminDashboardPeriodSelect } from "@/components/admin-dashboard-period-select";
import { AdminRestockTrendChart } from "@/components/admin-restock-trend-chart";
import { SignOutButton } from "@/components/sign-out-button";
import { db } from "@/db";
import {
  distributorProfiles,
  markets,
  products,
  restockOrders,
} from "@/db/schema";

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

export default async function AdminHomePage({
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
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const nextYearStart = new Date(today.getFullYear() + 1, 0, 1);
  const dataStart = weekStart < yearStart ? weekStart : yearStart;
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);
    return date;
  });
  const monthDays = Array.from(
    {
      length: Math.round(
        (nextMonthStart.getTime() - monthStart.getTime()) / 86_400_000,
      ),
    },
    (_, index) => {
      const date = new Date(monthStart);
      date.setDate(monthStart.getDate() + index);
      return date;
    },
  );

  const [
    restockCount,
    pendingRestockCount,
    distributorCount,
    productCount,
    marketCount,
    restockRequests,
    pendingRestockPreview,
    previousMonthRestockCount,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(restockOrders)
      .where(gte(restockOrders.createdAt, weekStart)),
    db
      .select({ value: count() })
      .from(restockOrders)
      .where(eq(restockOrders.status, "submitted")),
    db
      .select({ value: count() })
      .from(distributorProfiles)
      .where(eq(distributorProfiles.isActive, true)),
    db
      .select({ value: count() })
      .from(products)
      .where(eq(products.isActive, true)),
    db.select({ value: count() }).from(markets),
    db
      .select({ createdAt: restockOrders.createdAt })
      .from(restockOrders)
      .where(
        and(
          gte(restockOrders.createdAt, dataStart),
          lt(restockOrders.createdAt, nextYearStart),
        ),
      ),
    db
      .select({
        id: restockOrders.id,
        createdAt: restockOrders.createdAt,
        distributor: distributorProfiles.businessName,
      })
      .from(restockOrders)
      .innerJoin(
        distributorProfiles,
        eq(distributorProfiles.id, restockOrders.distributorId),
      )
      .where(eq(restockOrders.status, "submitted"))
      .orderBy(desc(restockOrders.createdAt))
      .limit(3),
    db
      .select({ value: count() })
      .from(restockOrders)
      .where(
        and(
          gte(restockOrders.createdAt, previousMonthStart),
          lt(restockOrders.createdAt, monthStart),
        ),
      ),
  ]);

  const restockTrend = monthDays.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const requests = restockRequests.filter(
      (request) =>
        request.createdAt >= date && request.createdAt < nextDate,
    ).length;

    return {
      label: `${new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date)} ${date.getDate()}`,
      date: new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(date),
      requests,
    };
  });

  const restockWeekTrend = weekDays.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    return {
      label: new Intl.DateTimeFormat("en-NG", { weekday: "short" }).format(date),
      date: new Intl.DateTimeFormat("en-NG", {
        weekday: "long",
        day: "numeric",
        month: "short",
      }).format(date),
      requests: restockRequests.filter(
        (request) => request.createdAt >= date && request.createdAt < nextDate,
      ).length,
    };
  });

  const restockYearTrend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today.getFullYear(), index, 1);
    const nextDate = new Date(today.getFullYear(), index + 1, 1);
    return {
      label: new Intl.DateTimeFormat("en-NG", { month: "short" }).format(date),
      date: new Intl.DateTimeFormat("en-NG", { month: "long", year: "numeric" }).format(date),
      requests: restockRequests.filter((request) => request.createdAt >= date && request.createdAt < nextDate).length,
    };
  });

  const restockRequestsThisMonth = restockTrend.reduce(
    (total, point) => total + point.requests,
    0,
  );
  const previousMonthRequests = previousMonthRestockCount[0]?.value ?? 0;
  const monthComparison =
    previousMonthRequests === 0
      ? restockRequestsThisMonth
        ? { label: "New activity this month", tone: "text-emerald-600" }
        : { label: "No change from last month", tone: "text-slate-500" }
      : (() => {
          const percentage = Math.round(
            ((restockRequestsThisMonth - previousMonthRequests) /
              previousMonthRequests) *
              100,
          );
          if (percentage === 0) {
            return { label: "No change from last month", tone: "text-slate-500" };
          }
          return {
            label: `${percentage > 0 ? "↑" : "↓"} ${Math.abs(percentage)}% vs last month`,
            tone: percentage > 0 ? "text-emerald-600" : "text-rose-600",
          };
        })();

  const restockRequestsThisWeek = restockCount[0]?.value ?? 0;
  const restockRequestsThisYear = restockYearTrend.reduce(
    (total, point) => total + point.requests,
    0,
  );
  const selectedRestockRequests =
    period === "week"
      ? restockRequestsThisWeek
      : period === "month"
        ? restockRequestsThisMonth
        : restockRequestsThisYear;
  const pendingRestockRequests = pendingRestockCount[0]?.value ?? 0;
  const activeDistributors = distributorCount[0]?.value ?? 0;
  const activeProducts = productCount[0]?.value ?? 0;
  const activeMarkets = marketCount[0]?.value ?? 0;
  const metrics = [
    {
      icon: ClipboardCheck,
      label: `Restock requests this ${period}`,
      value: String(selectedRestockRequests),
      change: selectedRestockRequests
        ? "Distributor requests received"
        : `No requests this ${period}`,
      tone: "text-indigo-600",
    },
    {
      icon: CircleAlert,
      label: "Awaiting approval",
      value: String(pendingRestockRequests),
      change: pendingRestockRequests
        ? "Restock requests need review"
        : "Approval queue is clear",
      tone: pendingRestockRequests ? "text-amber-600" : "text-emerald-600",
      href: "/admin/restock",
    },
    {
      icon: Package,
      label: "Products in catalogue",
      value: String(activeProducts),
      change: activeProducts
        ? "Products available for ordering"
        : "No stock records yet",
      tone: activeProducts ? "text-emerald-600" : "text-slate-500",
    },
  ];
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
          <AdminDashboardPeriodSelect value={period} />
          <button
            aria-label="More dashboard actions"
            className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          >
            <MoreHorizontal size={17} />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {metrics.map(({ icon: Icon, label, value, change, tone, href }) => {
          const card = (
            <section className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
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
          );

          return href ? (
            <a className="block transition-transform hover:-translate-y-0.5" href={href} key={label}>
              {card}
            </a>
          ) : (
            <div key={label}>{card}</div>
          );
        })}
      </div>

      <div className="mt-4">
        <Panel
          icon={ClipboardCheck}
          title="Restock request trend"
        >
          <AdminRestockTrendChart
            monthComparison={monthComparison}
            monthData={restockTrend}
            period={period}
            weekData={restockWeekTrend}
            yearData={restockYearTrend}
          />
        </Panel>
      </div>

      <section className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="panel-heading flex h-12 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <CircleAlert size={16} className="text-amber-500" />
            Needs review
          </div>
          <a className="text-xs font-medium text-slate-700 hover:text-slate-950" href="/admin/restock">
            View all requests
          </a>
        </div>
        {pendingRestockPreview.length ? (
          <div className="grid divide-y divide-slate-100 md:grid-cols-3 md:divide-x md:divide-y-0">
            {pendingRestockPreview.map((request) => (
              <a className="block px-4 py-3 hover:bg-slate-50" href="/admin/restock" key={request.id}>
                <p className="truncate text-sm font-medium text-slate-700">{request.distributor}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(request.createdAt)}
                </p>
              </a>
            ))}
          </div>
        ) : (
          <p className="px-4 py-6 text-sm text-slate-500">The approval queue is clear.</p>
        )}
      </section>

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
              {activeMarkets || activeDistributors
                ? "Demo network is active"
                : "No activity yet"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {activeMarkets || activeDistributors
                ? `${activeMarkets} markets and ${activeDistributors} distributors are available for setup.`
                : "Territory, distributor, stock, and order events will be recorded here."}
            </p>
          </div>
        </Panel>
        <Panel icon={Bell} title="Network health">
          <div className="space-y-4 p-4">
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-600">Territory coverage</span>
                <span className="font-medium text-slate-700">
                  {activeMarkets} markets
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: activeMarkets ? "100%" : "0%" }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-slate-600">Catalogue readiness</span>
                <span className="font-medium text-slate-700">
                  {activeProducts} products
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: activeProducts ? "100%" : "0%" }}
                />
              </div>
            </div>
            <button className="inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950">
              View setup guide
              <ArrowUpRight size={14} />
            </button>
          </div>
        </Panel>
      </div>

      <section className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <ClipboardCheck size={16} className="text-slate-500" />
          Restock operations
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Review distributor restock requests, approve available stock, and
          track dispatches from one queue.
        </p>
        <a
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-950"
          href="/admin/restock"
        >
          Open restock approvals
          <ArrowUpRight size={14} />
        </a>
      </section>
    </main>
  );
}
