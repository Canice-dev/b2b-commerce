"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  adminDistributorConversations,
  adminDistributorMessages,
  restockOrders,
} from "@/db/schema";
import {
  getMessageBody,
  getOrCreateAdminDistributorConversation,
} from "@/lib/admin-distributor-chat";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export async function sendDistributorAdminMessage(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session
    ? await getActiveDistributor(session.user.id)
    : null;
  if (!session || !distributor) throw new Error("Unauthorized");

  const body = getMessageBody(formData);
  const restockOrderIdValue = formData.get("restockOrderId");
  const restockOrderId =
    typeof restockOrderIdValue === "string" ? restockOrderIdValue : "";
  const [restockOrder] = restockOrderId
    ? await db
        .select({ id: restockOrders.id })
        .from(restockOrders)
        .where(
          and(
            eq(restockOrders.id, restockOrderId),
            eq(restockOrders.distributorId, distributor.id),
          ),
        )
        .limit(1)
    : [undefined];
  if (restockOrderId && !restockOrder)
    throw new Error("Restock request not found.");
  const conversation = await getOrCreateAdminDistributorConversation(
    distributor.id,
  );
  await db.insert(adminDistributorMessages).values({
    conversationId: conversation.id,
    senderUserId: session.user.id,
    restockOrderId: restockOrder?.id,
    body,
  });
  await db
    .update(adminDistributorConversations)
    .set({ updatedAt: new Date() })
    .where(eq(adminDistributorConversations.id, conversation.id));

  revalidatePath("/admin/messages");
  revalidatePath("/distributor/messages");
}

export async function markDistributorConversationRead(conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session
    ? await getActiveDistributor(session.user.id)
    : null;
  if (!session || !distributor) throw new Error("Unauthorized");
  await db
    .update(adminDistributorConversations)
    .set({ lastDistributorReadAt: new Date() })
    .where(
      and(
        eq(adminDistributorConversations.id, conversationId),
        eq(adminDistributorConversations.distributorId, distributor.id),
      ),
    );
  revalidatePath("/distributor", "layout");
}
