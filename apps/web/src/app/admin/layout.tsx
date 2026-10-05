import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AdminSidebar } from "@/components/admin-sidebar";
import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";
import { getAdminUnreadMessageCount } from "@/lib/admin-distributor-chat";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (!(await isCompanyAdmin(session.user.id))) {
    redirect("/sign-in?error=not-authorized");
  }
  const unreadMessages = await getAdminUnreadMessageCount();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <AdminSidebar
        email={session.user.email}
        name={session.user.name ?? "Company Admin"}
        unreadMessages={unreadMessages}
      />
      <div className="min-h-screen lg:pl-(--admin-sidebar-width) transition-[padding] duration-200">
        {children}
      </div>
    </div>
  );
}
