import "server-only";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getActiveDistributor } from "@/lib/authorization";

export async function getPortalDistributor() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session ? getActiveDistributor(session.user.id) : null;
}

export const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
export const statusLabel = (status: string) => status.replaceAll("_", " ");
