import { and, desc, eq, inArray } from "drizzle-orm";
import { Truck } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { DataTable, PortalPage } from "../_components/portal-page";
import {
  formatNaira,
  getPortalDistributor,
  statusLabel,
} from "../_components/data";

export default async function DeliveriesPage() {
  const distributor = await getPortalDistributor();
  if (!distributor) return null;
  const deliveryOrders = await db
    .select({
      id: orders.id,
      customer: orders.customerBusinessNameSnapshot,
      address: orders.deliveryAddressSnapshot,
      dispatchedAt: orders.dispatchedAt,
      deliveredAt: orders.deliveredAt,
      total: orders.orderedTotalKobo,
      status: orders.fulfilmentStatus,
    })
    .from(orders)
    .where(
      and(
        eq(orders.distributorId, distributor.id),
        inArray(orders.fulfilmentStatus, ["out_for_delivery", "delivered"]),
      ),
    )
    .orderBy(desc(orders.updatedAt));
  return (
    <PortalPage
      description="Track all active and completed deliveries."
      icon={Truck}
      title="Deliveries"
    >
      <DataTable
        headers={[
          "Order",
          "Customer",
          "Delivery address",
          "Dispatched",
          "Status",
          "Value",
        ]}
      >
        {deliveryOrders.length ? (
          deliveryOrders.map((order) => (
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
              <td className="border-t border-slate-100 px-4 py-3 text-slate-600">
                {order.dispatchedAt
                  ? new Intl.DateTimeFormat("en-NG", {
                      dateStyle: "medium",
                    }).format(order.dispatchedAt)
                  : "Not dispatched"}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 capitalize text-slate-600">
                {statusLabel(order.status)}
              </td>
              <td className="border-t border-slate-100 px-4 py-3 font-medium text-slate-800">
                {formatNaira(order.total)}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              className="border-t border-slate-100 px-4 py-10 text-center text-sm text-slate-500"
              colSpan={6}
            >
              There are no active or completed deliveries yet.
            </td>
          </tr>
        )}
      </DataTable>
    </PortalPage>
  );
}
