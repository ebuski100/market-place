import { create } from "zustand";

type StoreCounts = {
  cartCount: number;
  wishlistCount: number;

  setCartCount: (count: number) => void;
  setWishlistCount: (count: number) => void;

  incrementCart: (amount?: number) => void;
  decrementCart: (amount?: number) => void;

  incrementWishlist: () => void;
  decrementWishlist: () => void;
};

export const useStoreCounts = create<StoreCounts>((set) => ({
  cartCount: 0,
  wishlistCount: 0,

  setCartCount: (count) =>
    set({
      cartCount: count,
    }),

  setWishlistCount: (count) =>
    set({
      wishlistCount: count,
    }),

  incrementCart: (amount = 1) =>
    set((state) => ({
      cartCount: state.cartCount + amount,
    })),

  decrementCart: (amount = 1) =>
    set((state) => ({
      cartCount: Math.max(0, state.cartCount - amount),
    })),

  incrementWishlist: () =>
    set((state) => ({
      wishlistCount: state.wishlistCount + 1,
    })),

  decrementWishlist: () =>
    set((state) => ({
      wishlistCount: Math.max(0, state.wishlistCount - 1),
    })),
}));
