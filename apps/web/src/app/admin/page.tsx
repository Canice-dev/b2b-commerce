import { headers } from "next/headers";

import { auth } from "@/lib/auth";

export default async function AdminHomePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Operations</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Welcome{session?.user.name ? `, ${session.user.name}` : ""}</h1><section className="mt-6 rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-medium">Admin authentication is ready</h2><p className="mt-1 text-sm leading-6 text-slate-600">Next, we can build territory and distributor management here.</p></section></main>;
}
