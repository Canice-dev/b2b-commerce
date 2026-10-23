import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/expo";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartProduct = {
  id: string;
  name: string;
  variant: string | null;
  unit: string;
  unitPriceKobo: number;
  imageUrl: string | null;
};

export type CartLine = {
  product: CartProduct;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotalKobo: number;
  isReady: boolean;
  addItem: (product: CartProduct, quantity: number) => void;
  changeQuantity: (productId: string, change: number) => void;
  removeItem: (productId: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "b2b-commerce-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const [storedItems, setStoredItems] = useState<CartLine[]>([]);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const isReady = Boolean(
    isLoaded && isSignedIn && userId && loadedUserId === userId,
  );

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !userId) {
      setLoadedUserId(null);
      setStoredItems([]);
      return;
    }

    let cancelled = false;
    setLoadedUserId(null);
    setStoredItems([]);
    void AsyncStorage.getItem(`${storageKey}:${userId}`)
      .then((value) => {
        if (!value || cancelled) return;
        const parsed = JSON.parse(value) as CartLine[];
        if (Array.isArray(parsed)) {
          setStoredItems(
            parsed.filter(
              (line) =>
                line &&
                line.product &&
                typeof line.product.id === "string" &&
                Number.isInteger(line.quantity) &&
                line.quantity > 0,
            ),
          );
        }
      })
      .catch((error) =>
        console.warn("Unable to restore the saved cart.", error),
      )
      .finally(() => {
        if (!cancelled) setLoadedUserId(userId);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, userId]);

  useEffect(() => {
    if (!isReady || !userId) return;
    void AsyncStorage.setItem(
      `${storageKey}:${userId}`,
      JSON.stringify(storedItems),
    ).catch((error) => console.warn("Unable to save the cart.", error));
  }, [isReady, storedItems, userId]);

  const addItem = useCallback(
    (product: CartProduct, quantity: number) => {
      if (!isReady || quantity <= 0) return;
      setStoredItems((items) => {
        const existing = items.find((item) => item.product.id === product.id);
        return existing
          ? items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...items, { product, quantity }];
      });
    },
    [isReady],
  );

  const changeQuantity = useCallback(
    (productId: string, change: number) => {
      if (!isReady) return;
      setStoredItems((items) =>
        items
          .map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + change }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [isReady],
  );

  const removeItem = useCallback(
    (productId: string) => {
      if (!isReady) return;
      setStoredItems((items) =>
        items.filter((item) => item.product.id !== productId),
      );
    },
    [isReady],
  );

  const items = isReady ? storedItems : [];
  const value = useMemo(
    () => ({
      items,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotalKobo: items.reduce(
        (total, item) => total + item.product.unitPriceKobo * item.quantity,
        0,
      ),
      isReady,
      addItem,
      changeQuantity,
      removeItem,
    }),
    [items, isReady, addItem, changeQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart must be used inside CartProvider.");
  return cart;
}
