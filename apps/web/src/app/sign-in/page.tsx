import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isCompanyAdmin } from "@/lib/authorization";

import { SignInForm } from "./sign-in-form";

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session && (await isCompanyAdmin(session.user.id))) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Distributor Direct</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Company admin sign in</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use the account provisioned for your company operations team.</p>
        </div>
        <SignInForm />
      </section>
    </main>
  );
}
