import { desc, eq } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { db } from "@/db";
import { distributorProfiles, orders } from "@/db/schema";

const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(
    kobo / 100,
  );

export default async function OrdersPage() {
  const orderRows = await db
    .select({
      id: orders.id,
      customer: orders.customerBusinessNameSnapshot,
      distributor: distributorProfiles.businessName,
      paymentStatus: orders.paymentStatus,
      fulfilmentStatus: orders.fulfilmentStatus,
      totalKobo: orders.orderedTotalKobo,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(
      distributorProfiles,
      eq(orders.distributorId, distributorProfiles.id),
    )
    .orderBy(desc(orders.createdAt));
  return (
    <AdminPageShell
      action="Create order"
      description="Monitor customer orders from placement through delivery."
      icon={ShoppingCart}
      label="Orders"
      title="Order management"
    >
      <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <p className="text-sm font-medium text-slate-700">All orders</p>
          <span className="text-xs text-slate-500">
            {orderRows.length} total
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-200 text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Distributor</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Fulfilment</th>
                <th className="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody>
              {orderRows.length ? (
                orderRows.map((order) => (
                  <tr key={order.id}>
                    <td className="border-t border-slate-100 px-4 py-3 font-mono text-xs text-slate-600">
                      {order.id.slice(0, 8)}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {order.customer}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-slate-700">
                      {order.distributor}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 capitalize text-slate-600">
                      {order.paymentStatus.replaceAll("_", " ")}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 capitalize text-slate-600">
                      {order.fulfilmentStatus.replaceAll("_", " ")}
                    </td>
                    <td className="border-t border-slate-100 px-4 py-3 text-right font-medium text-slate-800">
                      {formatNaira(order.totalKobo)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    className="border-t border-slate-100 px-4 py-10 text-center text-slate-500"
                    colSpan={6}
                  >
                    No orders yet. Orders will appear when customers begin
                    purchasing.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
