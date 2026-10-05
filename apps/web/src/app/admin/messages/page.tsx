import { asc, desc, eq } from "drizzle-orm";
import { MessageCircle, Send } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
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
  distributorProfiles,
  users,
} from "@/db/schema";
import {
  markAdminDistributorConversationRead,
  sendAdminDistributorMessage,
} from "./actions";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ distributorId?: string }>;
}) {
  const { distributorId } = await searchParams;
  const distributors = await db
    .select({
      id: distributorProfiles.id,
      businessName: distributorProfiles.businessName,
      ownerUserId: distributorProfiles.ownerUserId,
    })
    .from(distributorProfiles)
    .where(eq(distributorProfiles.isActive, true))
    .orderBy(asc(distributorProfiles.businessName));
  const selectedDistributor =
    distributors.find((distributor) => distributor.id === distributorId) ??
    distributors[0];
  const [conversation] = selectedDistributor
    ? await db
        .select({
          id: adminDistributorConversations.id,
          lastAdminReadAt: adminDistributorConversations.lastAdminReadAt,
        })
        .from(adminDistributorConversations)
        .where(
          eq(
            adminDistributorConversations.distributorId,
            selectedDistributor.id,
          ),
        )
        .limit(1)
    : [];
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
  const hasUnreadMessages = Boolean(
    conversation &&
      messages.some(
        (message) =>
          message.senderUserId === selectedDistributor?.ownerUserId &&
          (!conversation.lastAdminReadAt ||
            message.createdAt > conversation.lastAdminReadAt),
      ),
  );

  return (
    <AdminPageShell
      action=""
      actionSlot={
        <span className="text-xs text-slate-500">Private company channels</span>
      }
      description="Chat directly with each distributor about stock, dispatches, and operations."
      icon={MessageCircle}
      label="Messages"
      title="Distributor messages"
    >
      <section className="mt-6 grid min-h-145 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-100 px-4 py-3 text-xs font-medium text-slate-500">
            Distributors
          </div>
          <div className="max-h-52 overflow-y-auto lg:max-h-none">
            {distributors.map((distributor) => {
              const active = distributor.id === selectedDistributor?.id;
              return (
                <a
                  className={`block border-b border-slate-100 px-4 py-3 text-sm transition hover:bg-slate-50 ${active ? "bg-slate-50 font-medium text-slate-900" : "text-slate-600"}`}
                  href={`/admin/messages?distributorId=${distributor.id}`}
                  key={distributor.id}
                >
                  {distributor.businessName}
                </a>
              );
            })}
          </div>
        </aside>
        <div className="flex min-h-0 flex-col">
          {selectedDistributor ? (
            <>
              {conversation && hasUnreadMessages ? (
                <ChatReadMarker
                  markRead={markAdminDistributorConversationRead.bind(
                    null,
                    conversation.id,
                  )}
                />
              ) : null}
              <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-5 py-4">
                <span className="grid size-9 place-items-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                  {selectedDistributor.businessName.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedDistributor.businessName}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Private distributor channel
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-5 overflow-y-auto bg-slate-100/70 p-5 sm:p-6">
                {messages.length ? (
                  messages.map((message) => {
                    const fromDistributor =
                      message.senderUserId === selectedDistributor.ownerUserId;
                    const sender = fromDistributor
                      ? selectedDistributor.businessName
                      : (message.senderName ?? "Company admin");
                    return (
                      <Message
                        align={fromDistributor ? "start" : "end"}
                        key={message.id}
                      >
                        <MessageAvatar
                          className={
                            fromDistributor
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
                            className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${fromDistributor ? "rounded-tl-md border border-slate-200 bg-white text-slate-700" : "rounded-tr-md bg-slate-800 text-white"}`}
                          >
                            <p className="whitespace-pre-wrap">
                              {message.body}
                            </p>
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
                      No messages yet. Start the conversation with{" "}
                      {selectedDistributor.businessName}.
                    </p>
                  </div>
                )}
              </div>
              <form
                action={sendAdminDistributorMessage}
                className="border-t border-slate-200 bg-white p-4"
              >
                <input
                  name="distributorId"
                  type="hidden"
                  value={selectedDistributor.id}
                />
                <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-slate-400 focus-within:bg-white">
                  <textarea
                    className="min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    maxLength={2000}
                    name="body"
                    placeholder={`Message ${selectedDistributor.businessName}`}
                    required
                  />
                  <button
                    className="h-12 rounded-full bg-slate-800 px-3 text-white transition hover:bg-slate-700"
                    type="submit"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-6 text-center text-sm text-slate-500">
              No active distributors are available for messaging.
            </div>
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}
