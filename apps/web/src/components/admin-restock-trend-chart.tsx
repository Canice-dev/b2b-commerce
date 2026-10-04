"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type RestockTrendPoint = {
  label: string;
  date: string;
  requests: number;
};

type Comparison = {
  label: string;
  tone: string;
};

const chartConfig = {
  requests: {
    label: "Requests",
    color: "#334155",
  },
} satisfies ChartConfig;

export function AdminRestockTrendChart({
  monthData,
  yearData,
  weekData,
  monthComparison,
  period,
}: {
  monthData: RestockTrendPoint[];
  yearData: RestockTrendPoint[];
  weekData: RestockTrendPoint[];
  monthComparison: Comparison;
  period: "week" | "month" | "year";
}) {
  const data = period === "week" ? weekData : period === "month" ? monthData : yearData;
  const hasRequests = data.some((point) => point.requests > 0);
  const requestCount = data.reduce((total, point) => total + point.requests, 0);
  const comparison =
    period === "month" ? monthComparison : period === "week"
      ? { label: "Monday to Sunday", tone: "text-slate-500" }
      : { label: "January to December", tone: "text-slate-500" };

  return (
    <div className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <p className="text-3xl font-semibold tracking-tight">
            {requestCount}
          </p>
          <p className={`text-xs ${comparison.tone}`}>{comparison.label}</p>
        </div>
      </div>
      {hasRequests ? (
        <ChartContainer
          className="mt-6 h-52 w-full aspect-auto"
          config={chartConfig}
        >
          <BarChart
            accessibilityLayer
            data={data}
            margin={{ top: 8, right: 4, left: -24 }}
          >
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              axisLine={false}
              dataKey="label"
              interval={period === "month" ? 3 : 0}
              tickLine={false}
              tickMargin={10}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(_, payload) =>
                    payload[0]?.payload.date ?? ""
                  }
                />
              }
              cursor={{ fill: "#f1f5f9" }}
            />
            <Bar
              barSize={period === "month" ? 8 : period === "week" ? 28 : 28}
              dataKey="requests"
              fill="var(--color-requests)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      ) : (
        <div className="mt-6 grid h-52 place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center">
          <p className="text-xs text-slate-500">
            No restock requests have been submitted this {period}.
          </p>
        </div>
      )}
    </div>
  );
}
