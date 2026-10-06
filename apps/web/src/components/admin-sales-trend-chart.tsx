"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sales: { label: "Sales", color: "#0f766e" },
} satisfies ChartConfig;

export function AdminSalesTrendChart({
  data,
  period,
}: {
  data: { label: string; date: string; sales: number }[];
  period: "week" | "month" | "year";
}) {
  const hasSales = data.some((point) => point.sales > 0);

  if (!hasSales) {
    return (
      <div className="grid h-64 place-items-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-500">
        No sales recorded for this {period}.
      </div>
    );
  }

  return (
    <ChartContainer className="h-64 w-full aspect-auto" config={chartConfig}>
      <AreaChart
        accessibilityLayer
        data={data}
        margin={{ top: 12, right: 8, left: -18 }}
      >
        <defs>
          <linearGradient id="sales-fill" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-sales)"
              stopOpacity={0.28}
            />
            <stop
              offset="95%"
              stopColor="var(--color-sales)"
              stopOpacity={0.02}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#e2e8f0" />
        <XAxis
          axisLine={false}
          dataKey="label"
          interval={period === "month" ? 3 : 0}
          tick={{ fontSize: 10 }}
          tickLine={false}
          tickMargin={10}
        />
        <YAxis
          axisLine={false}
          tickFormatter={(value) => `₦${Math.round(value / 100_000)}k`}
          tickLine={false}
          width={48}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              indicator="line"
              labelFormatter={(_, payload) => payload[0]?.payload.date ?? ""}
              formatter={(value) =>
                new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  maximumFractionDigits: 0,
                }).format(Number(value) / 100)
              }
            />
          }
          cursor={{ stroke: "#94a3b8", strokeDasharray: "3 3" }}
        />
        <Area
          dataKey="sales"
          fill="url(#sales-fill)"
          stroke="var(--color-sales)"
          strokeWidth={2.5}
          type="monotone"
        />
      </AreaChart>
    </ChartContainer>
  );
}
