import { and, desc, eq, inArray } from "drizzle-orm";
import { ShoppingCart } from "lucide-react";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { DataTable, PortalPage } from "../_components/portal-page";
import {
  formatNaira,
  getPortalDistributor,
  statusLabel,
} from "../_components/data";

export default async function OrderQueuePage() {
  const distributor = await getPortalDistributor();
  if (!distributor) return null;
  const queuedOrders = await db
    .select({
      id: orders.id,
      customer: orders.customerBusinessNameSnapshot,
      address: orders.deliveryAddressSnapshot,
      phone: orders.customerPhoneSnapshot,
      total: orders.orderedTotalKobo,
      status: orders.fulfilmentStatus,
    })
    .from(orders)
    .where(
      and(
        eq(orders.distributorId, distributor.id),
        inArray(orders.fulfilmentStatus, [
          "confirmed",
          "partially_fulfilled",
          "unable_to_fulfil",
        ]),
      ),
    )
    .orderBy(desc(orders.createdAt));
  return (
    <PortalPage
      description="Prepare and manage orders awaiting fulfilment."
      icon={ShoppingCart}
      title="Order queue"
    >
      <DataTable
        headers={[
          "Order",
          "Customer",
          "Delivery address",
          "Phone",
          "Status",
          "Value",
        ]}
      >
        {queuedOrders.length ? (
          queuedOrders.map((order) => (
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
                {order.phone}
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
              No orders are waiting for fulfilment.
            </td>
          </tr>
        )}
      </DataTable>
    </PortalPage>
  );
}
