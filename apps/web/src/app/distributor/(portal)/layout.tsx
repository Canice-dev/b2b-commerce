import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DistributorSidebar } from "@/components/distributor-sidebar";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export default async function DistributorPortalLayout({
  children,
}: LayoutProps<"/distributor">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/distributor/sign-in");
  const distributor = await getActiveDistributor(session.user.id);
  if (!distributor) {
    redirect("/distributor/sign-in?error=not-authorized");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <DistributorSidebar
        businessName={distributor.businessName}
        email={session.user.email ?? ""}
      />
      <div className="min-h-screen transition-[padding] duration-200 lg:pl-(--distributor-sidebar-width)">
        {children}
      </div>
    </div>
  );
}
