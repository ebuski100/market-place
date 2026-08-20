"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { Cart, CartItem } from "@/types/cart";
import type { GuestCartItem } from "@/lib/guestCart";

import {
  getGuestCart,
  updateGuestCartQuantity,
  removeFromGuestCart,
} from "@/lib/guestCart";

import CartItemControls from "./CartItemControls";
import AuthPromptModal from "./AuthPromptModal";
import { useAuth } from "@/hooks/useAuth";

type CartClientProps = {
  initialCart: Cart | null;
  isAuthenticated: boolean;
};

export default function CartClient({
  initialCart,
  isAuthenticated,
}: CartClientProps) {
  const router = useRouter();

  const { isAuthenticated: currentAuth, loading: authLoading } = useAuth();

  const [items, setItems] = useState<CartItem[]>(initialCart?.items ?? []);

  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const [loadingItem, setLoadingItem] = useState<number | null>(null);

  const [guestItems, setGuestItems] = useState<GuestCartItem[]>(() =>
    getGuestCart(),
  );

  // ---------------------------------------
  // Guest cart total
  // ---------------------------------------

  const guestTotal = guestItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // ---------------------------------------
  // Database cart total
  // ---------------------------------------

  const cartTotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  // ---------------------------------------
  // Guest quantity update
  // ---------------------------------------

  function updateGuestQuantity(productId: number, quantity: number) {
    const updatedItems = updateGuestCartQuantity(productId, quantity);

    setGuestItems(updatedItems);
  }

  // ---------------------------------------
  // Guest remove
  // ---------------------------------------

  function removeGuestItem(productId: number) {
    const updatedItems = removeFromGuestCart(productId);

    setGuestItems(updatedItems);
  }

  // ---------------------------------------
  // Logged-in quantity update
  // ---------------------------------------

  async function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    const previousItems = items;

    // Optimistic update
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
            }
          : item,
      ),
    );

    setLoadingItem(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        setItems(previousItems);

        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error(error);

      setItems(previousItems);

      alert("Something went wrong");
    } finally {
      setLoadingItem(null);
    }
  }

  // ---------------------------------------
  // Logged-in remove
  // ---------------------------------------

  async function removeItem(itemId: number) {
    const previousItems = items;

    // Optimistic update
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    setLoadingItem(itemId);

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();

        setItems(previousItems);

        alert(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error(error);

      setItems(previousItems);

      alert("Something went wrong");
    } finally {
      setLoadingItem(null);
    }
  }

  // ---------------------------------------
  // Guest cart UI
  // ---------------------------------------

  if (!isAuthenticated) {
    if (guestItems.length === 0) {
      return <p className="text-gray-500">Your cart is empty.</p>;
    }

    return (
      <div className="w-full max-w-4xl space-y-6">
        {guestItems.map((item) => (
          <div key={item.product.id} className="flex gap-6 border-b pb-6">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-24 w-24 rounded object-cover"
            />

            <div className="flex-1">
              <h2 className="text-lg font-semibold">{item.product.name}</h2>

              <p className="text-gray-500">
                ₦{item.product.price.toLocaleString()}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  disabled={item.quantity <= 1}
                  onClick={() =>
                    updateGuestQuantity(item.product.id, item.quantity - 1)
                  }
                  className="h-8 w-8 rounded border disabled:opacity-40"
                >
                  -
                </button>

                <span className="mx-5 min-w-5 text-center">
                  {item.quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateGuestQuantity(item.product.id, item.quantity + 1)
                  }
                  className="h-8 w-8 rounded border"
                >
                  +
                </button>

                <button
                  type="button"
                  onClick={() => removeGuestItem(item.product.id)}
                  className="ml-4 text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="font-semibold">
              ₦{(item.product.price * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}

        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>

          <span>₦{guestTotal.toLocaleString()}</span>
        </div>

        <button
          type="button"
          disabled={authLoading}
          onClick={() => setAuthPromptOpen(true)}
          className="w-full rounded-md bg-black py-3 text-white disabled:opacity-50"
        >
          {authLoading ? "Checking..." : "Proceed to Checkout"}
        </button>

        <AuthPromptModal
          open={authPromptOpen}
          onClose={() => setAuthPromptOpen(false)}
          title="Sign in to checkout"
          message="Please sign in or create an account before continuing to checkout."
        />
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="text-gray-500">Your cart is empty.</p>;
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {items.map((item) => (
        <div key={item.id} className="flex gap-6 border-b pb-6">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="h-24 w-24 rounded object-cover"
          />

          <div className="flex-1">
            <h2 className="text-lg font-semibold">{item.product.name}</h2>

            <p className="text-gray-500">
              ₦{item.product.price.toLocaleString()}
            </p>

            <CartItemControls
              item={item}
              loadingItem={loadingItem}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
            />
          </div>

          <p className="font-semibold">
            ₦{(item.product.price * item.quantity).toLocaleString()}
          </p>
        </div>
      ))}

      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>

        <span>₦{cartTotal.toLocaleString()}</span>
      </div>

      <button
        type="button"
        disabled={authLoading}
        onClick={() => {
          if (currentAuth) {
            router.push("/checkout");
            return;
          }

          setAuthPromptOpen(true);
        }}
        className="w-full rounded-md bg-black py-3 text-white disabled:opacity-50"
      >
        {authLoading ? "Checking..." : "Proceed to Checkout"}
      </button>

      <AuthPromptModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        title="Sign in to checkout"
        message="Please sign in or create an account before continuing to checkout."
      />
    </div>
  );
}
