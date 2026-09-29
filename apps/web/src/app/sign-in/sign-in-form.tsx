"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

export function SignInForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function signIn(formData: FormData) {
    setError(null);
    setIsSubmitting(true);
    const { error: signInError } = await authClient.signIn.email({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      callbackURL: "/admin",
    });
    setIsSubmitting(false);

    if (signInError) {
      setError("We could not sign you in with those details.");
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <form action={signIn} className="space-y-5">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-slate-700" htmlFor="email">Work email</label>
        <input autoComplete="email" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950" id="email" name="email" required type="email" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
          <span className="text-xs text-slate-400">Reset coming soon</span>
        </div>
        <input autoComplete="current-password" className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-950 focus:ring-1 focus:ring-slate-950" id="password" minLength={12} name="password" required type="password" />
      </div>
      {error ? <p aria-live="polite" className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      <button className="flex h-10 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
