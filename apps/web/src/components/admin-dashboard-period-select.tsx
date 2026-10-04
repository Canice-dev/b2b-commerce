"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Period = "week" | "month" | "year";

export function AdminDashboardPeriodSelect({ value }: { value: Period }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <label className="relative">
      <span className="sr-only">Dashboard period</span>
      <CalendarDays
        className="pointer-events-none absolute left-3 top-2.5 text-slate-500"
        size={15}
      />
      <select
        className="h-9 appearance-none rounded-lg border border-slate-200 bg-white py-1 pl-9 pr-8 text-xs font-medium text-slate-600 outline-none hover:bg-slate-50 focus:border-slate-400"
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("range", event.target.value);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        value={value}
      >
        <option value="week">This week</option>
        <option value="month">This month</option>
        <option value="year">This year</option>
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-2.5 text-slate-500"
        size={14}
      />
    </label>
  );
}
