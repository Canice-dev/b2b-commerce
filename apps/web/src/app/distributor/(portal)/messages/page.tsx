import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { MessageCircle, Send } from "lucide-react";
import { ChatReadMarker } from "@/components/chat-read-marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import { db } from "@/db";
import {
  adminDistributorConversations,
  adminDistributorMessages,
  users,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { getPortalDistributor } from "../_components/data";
import { PortalPage } from "../_components/portal-page";
import {
  markDistributorConversationRead,
  sendDistributorAdminMessage,
} from "./actions";

export default async function DistributorMessagesPage() {
  const [distributor, session] = await Promise.all([
    getPortalDistributor(),
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!distributor || !session) return null;
  const [conversation] = await db
    .select({
      id: adminDistributorConversations.id,
      lastDistributorReadAt:
        adminDistributorConversations.lastDistributorReadAt,
    })
    .from(adminDistributorConversations)
    .where(eq(adminDistributorConversations.distributorId, distributor.id))
    .limit(1);
  const messages = conversation
    ? (
        await db
          .select({
            id: adminDistributorMessages.id,
            body: adminDistributorMessages.body,
            createdAt: adminDistributorMessages.createdAt,
            senderUserId: adminDistributorMessages.senderUserId,
            senderName: users.name,
          })
          .from(adminDistributorMessages)
          .innerJoin(users, eq(users.id, adminDistributorMessages.senderUserId))
          .where(eq(adminDistributorMessages.conversationId, conversation.id))
          .orderBy(desc(adminDistributorMessages.createdAt))
          .limit(100)
      ).reverse()
    : [];
  const hasUnreadMessages = messages.some(
    (message) =>
      message.senderUserId !== session.user.id &&
      (!conversation?.lastDistributorReadAt ||
        message.createdAt > conversation.lastDistributorReadAt),
  );

  return (
    <PortalPage
      description="Speak directly with the company team about stock, dispatches, and operations."
      icon={MessageCircle}
      title="Company messages"
    >
      {conversation && hasUnreadMessages ? (
        <ChatReadMarker
          markRead={markDistributorConversationRead.bind(null, conversation.id)}
        />
      ) : null}
      <section className="mt-6 flex min-h-145 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
          <span className="grid size-9 place-items-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            DD
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Company team</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Private company channel
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-5 overflow-y-auto bg-slate-100/70 p-5 sm:p-6">
          {messages.length ? (
            messages.map((message) => {
              const own = message.senderUserId === session.user.id;
              const sender = own
                ? distributor.businessName
                : (message.senderName ?? "Company admin");
              return (
                <Message align={own ? "end" : "start"} key={message.id}>
                  <MessageAvatar
                    className={
                      own
                        ? "size-8 bg-emerald-100 text-[10px] font-semibold text-emerald-800"
                        : "size-8 bg-slate-800 text-[10px] font-semibold text-white"
                    }
                  >
                    {sender.slice(0, 2).toUpperCase()}
                  </MessageAvatar>
                  <MessageContent className="max-w-[78%] gap-1.5">
                    <MessageHeader className="px-1 text-[11px]">
                      {sender}
                    </MessageHeader>
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${own ? "rounded-tr-md bg-slate-800 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-700"}`}
                    >
                      <p className="whitespace-pre-wrap">{message.body}</p>
                    </div>
                    <MessageFooter className="px-1 text-[10px]">
                      {new Intl.DateTimeFormat("en-NG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(message.createdAt)}
                    </MessageFooter>
                  </MessageContent>
                </Message>
              );
            })
          ) : (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <p className="text-sm text-slate-500">
                No messages yet. Ask the company team anything about stock or
                dispatches.
              </p>
            </div>
          )}
        </div>
        <form
          action={sendDistributorAdminMessage}
          className="border-t border-slate-200 bg-white p-4"
        >
          <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-slate-400 focus-within:bg-white">
            <textarea
              className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
              maxLength={2000}
              name="body"
              placeholder="Message the company team"
              required
            />
            <button
              className="h-10 rounded-full bg-slate-800 px-4 text-xs font-medium text-white transition hover:bg-slate-700"
              type="submit"
            >
              <Send size={24} />
            </button>
          </div>
        </form>
      </section>
    </PortalPage>
  );
}
