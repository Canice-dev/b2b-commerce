import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export default async function DistributorPortalLayout({
  children,
}: LayoutProps<"/distributor">) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/distributor/sign-in");
  if (!(await getActiveDistributor(session.user.id))) {
    redirect("/distributor/sign-in?error=not-authorized");
  }

  return children;
}
