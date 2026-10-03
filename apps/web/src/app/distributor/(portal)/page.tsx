import { headers } from "next/headers";
import { Package } from "lucide-react";
import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export default async function DistributorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const distributor = session
    ? await getActiveDistributor(session.user.id)
    : null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Distributor Direct
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {distributor?.businessName ?? "Distributor dashboard"}
          </h1>
        </div>
        <SignOutButton redirectTo="/distributor/sign-in" />
      </header>
      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <Package className="size-6 text-slate-500" />
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Your ordering dashboard is ready
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          The company catalogue and distributor order flow will appear here.
        </p>
      </section>
    </main>
  );
}
