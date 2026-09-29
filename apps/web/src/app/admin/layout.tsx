import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

import { SignOutButton } from "./sign-out-button";

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");
  if (!(await isCompanyAdmin(session.user.id))) redirect("/sign-in?error=not-authorized");

  return <div className="min-h-screen bg-slate-50 text-slate-950"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6"><div><p className="text-sm font-semibold">Distributor Direct</p><p className="text-xs text-slate-500">Company administration</p></div><SignOutButton /></div></header>{children}</div>;
}
