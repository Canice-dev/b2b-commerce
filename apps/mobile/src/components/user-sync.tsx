import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

const apiUrl = process.env.EXPO_PUBLIC_WEB_API_URL;

/** Keeps the application's user table in sync whenever a Clerk session exists. */
export function UserSync() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    if (!apiUrl) {
      console.warn("EXPO_PUBLIC_WEB_API_URL is not configured; user sync skipped.");
      return;
    }

    void (async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("No Clerk session token was available.");

        const response = await fetch(`${apiUrl.replace(/\/$/, "")}/api/mobile/users/sync`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error(`User sync failed with ${response.status}.`);
        }
      } catch (error) {
        // Sync is retried at the next app launch or session restoration; it
        // must not prevent a newly authenticated customer from continuing.
        console.warn("Unable to sync user with the application database.", error);
      }
    })();
  }, [getToken, isLoaded, isSignedIn]);

  return null;
}
