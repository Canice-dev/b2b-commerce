import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";
import { SignInForm } from "@/app/sign-in/sign-in-form";

export default async function DistributorSignInPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session && (await getActiveDistributor(session.user.id))) {
    redirect("/distributor");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Distributor Direct
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Distributor sign in
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in with the email and temporary password supplied when your
            distributor account was created.
          </p>
        </div>
        <SignInForm callbackURL="/distributor" />
        <p className="mt-6 text-center text-xs text-slate-500">
          Company administrator?{" "}
          <Link
            className="font-medium text-slate-700 hover:text-slate-950 hover:underline"
            href="/sign-in"
          >
            Sign in here
          </Link>
        </p>
      </section>
    </main>
  );
}
