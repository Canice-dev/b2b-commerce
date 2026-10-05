"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/db";
import {
  adminDistributorConversations,
  adminDistributorMessages,
  distributorProfiles,
} from "@/db/schema";
import {
  getMessageBody,
  getOrCreateAdminDistributorConversation,
} from "@/lib/admin-distributor-chat";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

export async function sendAdminDistributorMessage(formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) {
    throw new Error("Unauthorized");
  }

  const distributorId = formData.get("distributorId");
  if (typeof distributorId !== "string" || !distributorId) {
    throw new Error("Choose a distributor first.");
  }
  const [distributor] = await db
    .select({ id: distributorProfiles.id })
    .from(distributorProfiles)
    .where(
      and(
        eq(distributorProfiles.id, distributorId),
        eq(distributorProfiles.isActive, true),
      ),
    )
    .limit(1);
  if (!distributor) throw new Error("Distributor not found.");

  const body = getMessageBody(formData);
  const conversation = await getOrCreateAdminDistributorConversation(
    distributor.id,
  );
  await db.insert(adminDistributorMessages).values({
    conversationId: conversation.id,
    senderUserId: session.user.id,
    body,
  });
  await db
    .update(adminDistributorConversations)
    .set({ updatedAt: new Date() })
    .where(eq(adminDistributorConversations.id, conversation.id));

  revalidatePath("/admin/messages");
  revalidatePath("/distributor/messages");
}

export async function markAdminDistributorConversationRead(conversationId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || !(await isCompanyAdmin(session.user.id))) {
    throw new Error("Unauthorized");
  }
  await db
    .update(adminDistributorConversations)
    .set({ lastAdminReadAt: new Date() })
    .where(eq(adminDistributorConversations.id, conversationId));
  revalidatePath("/admin", "layout");
}
