import { useAuth } from "@clerk/expo";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BusinessType = "retailer" | "wholesaler";
export type Market = {
  id: string;
  name: string;
  localGovernmentArea: string;
  state: string;
};

type OnboardingContextValue = {
  address: string;
  acceptedLegalTerms: boolean;
  businessName: string;
  businessType: BusinessType | null;
  completeOnboarding: () => Promise<string | null>;
  isComplete: boolean;
  isLoadingMarkets: boolean;
  isSubmitting: boolean;
  marketError: string | null;
  markets: Market[];
  phone: string;
  selectedMarket: Market | null;
  setAcceptedLegalTerms: (accepted: boolean) => void;
  setAddress: (address: string) => void;
  setBusinessName: (businessName: string) => void;
  setBusinessType: (businessType: BusinessType) => void;
  setPhone: (phone: string) => void;
  setSelectedMarket: (market: Market) => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);
const apiUrl = process.env.EXPO_PUBLIC_WEB_API_URL?.replace(/\/$/, "");

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getToken } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [acceptedLegalTerms, setAcceptedLegalTerms] = useState(false);
  const [isLoadingMarkets, setIsLoadingMarkets] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marketError, setMarketError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!apiUrl) {
      setMarketError("The app is not configured to load market locations.");
      setIsLoadingMarkets(false);
      return;
    }

    void fetch(`${apiUrl}/api/mobile/onboarding/markets`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const body = (await response.json()) as { markets: Market[] };
        setMarkets(body.markets);
      })
      .catch(() =>
        setMarketError(
          "We could not load available markets. Please try again.",
        ),
      )
      .finally(() => setIsLoadingMarkets(false));
  }, []);

  async function completeOnboarding() {
    if (!selectedMarket || !acceptedLegalTerms || !apiUrl || !businessType) {
      return "Complete all required details before continuing.";
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      if (!token)
        return "Your sign-in session has expired. Please sign in again.";
      const response = await fetch(`${apiUrl}/api/mobile/onboarding/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          phone,
          address,
          businessType,
          marketId: selectedMarket.id,
          acceptedLegalTerms,
        }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) return body.error || "Unable to save your details.";
      setIsComplete(true);
      return null;
    } catch {
      return "Unable to save your details. Please try again.";
    } finally {
      setIsSubmitting(false);
    }
  }

  const value = useMemo(
    () => ({
      address,
      acceptedLegalTerms,
      businessName,
      businessType,
      completeOnboarding,
      isComplete,
      isLoadingMarkets,
      isSubmitting,
      marketError,
      markets,
      phone,
      selectedMarket,
      setAcceptedLegalTerms,
      setAddress,
      setBusinessName,
      setBusinessType,
      setPhone,
      setSelectedMarket,
    }),
    [
      address,
      acceptedLegalTerms,
      businessName,
      businessType,
      isComplete,
      isLoadingMarkets,
      isSubmitting,
      marketError,
      markets,
      phone,
      selectedMarket,
    ],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const value = useContext(OnboardingContext);
  if (!value)
    throw new Error("useOnboarding must be used inside OnboardingProvider.");
  return value;
}
