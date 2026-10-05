import "server-only";

import { and, count, eq, gt, isNull, ne, or } from "drizzle-orm";
import { db } from "@/db";
import {
  adminDistributorConversations,
  adminDistributorMessages,
  distributorProfiles,
} from "@/db/schema";

export async function getOrCreateAdminDistributorConversation(
  distributorId: string,
) {
  await db
    .insert(adminDistributorConversations)
    .values({ distributorId, updatedAt: new Date() })
    .onConflictDoNothing({
      target: adminDistributorConversations.distributorId,
    });

  const [conversation] = await db
    .select({ id: adminDistributorConversations.id })
    .from(adminDistributorConversations)
    .where(eq(adminDistributorConversations.distributorId, distributorId))
    .limit(1);

  if (!conversation) throw new Error("Could not start this conversation.");
  return conversation;
}

export function getMessageBody(formData: FormData) {
  const body = formData.get("body");
  if (typeof body !== "string") throw new Error("Message is required.");
  const message = body.trim();
  if (!message) throw new Error("Message is required.");
  if (message.length > 2_000) {
    throw new Error("Messages cannot exceed 2,000 characters.");
  }
  return message;
}

export async function getAdminUnreadMessageCount() {
  const [result] = await db
    .select({ value: count() })
    .from(adminDistributorMessages)
    .innerJoin(
      adminDistributorConversations,
      eq(
        adminDistributorConversations.id,
        adminDistributorMessages.conversationId,
      ),
    )
    .innerJoin(
      distributorProfiles,
      eq(
        distributorProfiles.id,
        adminDistributorConversations.distributorId,
      ),
    )
    .where(
      and(
        eq(adminDistributorMessages.senderUserId, distributorProfiles.ownerUserId),
        or(
          isNull(adminDistributorConversations.lastAdminReadAt),
          gt(
            adminDistributorMessages.createdAt,
            adminDistributorConversations.lastAdminReadAt,
          ),
        ),
      ),
    );
  return result?.value ?? 0;
}

export async function getDistributorUnreadMessageCount(
  distributorId: string,
  userId: string,
) {
  const [result] = await db
    .select({ value: count() })
    .from(adminDistributorMessages)
    .innerJoin(
      adminDistributorConversations,
      eq(
        adminDistributorConversations.id,
        adminDistributorMessages.conversationId,
      ),
    )
    .where(
      and(
        eq(adminDistributorConversations.distributorId, distributorId),
        ne(adminDistributorMessages.senderUserId, userId),
        or(
          isNull(adminDistributorConversations.lastDistributorReadAt),
          gt(
            adminDistributorMessages.createdAt,
            adminDistributorConversations.lastDistributorReadAt,
          ),
        ),
      ),
    );
  return result?.value ?? 0;
}
