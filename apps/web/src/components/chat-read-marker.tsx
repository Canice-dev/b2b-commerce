"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function ChatReadMarker({
  markRead,
}: {
  markRead: () => Promise<void>;
}) {
  const router = useRouter();
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    void markRead().then(() => router.refresh());
  }, [markRead, router]);

  return null;
}
