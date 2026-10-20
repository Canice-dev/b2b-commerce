import { useAuth } from "@clerk/expo";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CustomerProfileContextValue = {
  isLoading: boolean;
  isOnboardingComplete: boolean;
  refresh: () => Promise<void>;
};

const CustomerProfileContext =
  createContext<CustomerProfileContextValue | null>(null);

const apiUrl = process.env.EXPO_PUBLIC_WEB_API_URL?.replace(/\/$/, "");

export function CustomerProfileProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const refresh = useCallback(async () => {
    if (!isSignedIn || !apiUrl) {
      setIsOnboardingComplete(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No Clerk session token was available.");

      const response = await fetch(
        `${apiUrl}/api/mobile/onboarding/profile`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Unable to load customer profile.");

      const body = (await response.json()) as { completed?: boolean };
      setIsOnboardingComplete(body.completed === true);
    } catch (error) {
      // Keep the customer in onboarding when their status cannot be verified.
      // This avoids exposing customer routes before a profile is available.
      console.warn("Unable to load mobile onboarding status.", error);
      setIsOnboardingComplete(false);
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isSignedIn]);

  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!isLoaded) return;
    void refreshRef.current();
  }, [isLoaded, isSignedIn]);

  const value = useMemo(
    () => ({ isLoading, isOnboardingComplete, refresh }),
    [isLoading, isOnboardingComplete, refresh],
  );

  return (
    <CustomerProfileContext.Provider value={value}>
      {children}
    </CustomerProfileContext.Provider>
  );
}

export function useCustomerProfile() {
  const value = useContext(CustomerProfileContext);
  if (!value) {
    throw new Error(
      "useCustomerProfile must be used inside CustomerProfileProvider.",
    );
  }
  return value;
}
