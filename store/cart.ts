import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  shopId: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: (shopId?: string) => number;
}

const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item: CartItem) => {
        const existing = get().items.find((i: CartItem) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i: CartItem) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId: string) => set({ items: get().items.filter((i: CartItem) => i.productId !== productId) }),
      clearCart: () => set({ items: [] }),
      total: (shopId?: string) =>
        get()
          .items.filter((i: CartItem) => !shopId || i.shopId === shopId)
          .reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0),
    }),
    { name: 'mtaaduka-cart' }
  )
);

export default useCartStore;