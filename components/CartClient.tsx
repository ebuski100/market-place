"use client";

import { useState } from "react";
import type { Cart } from "@/types/cart";
import CartItemControls from "./CartItemControls";

type CartClientProps = {
  initialCart: Cart;
};

export default function CartClient({ initialCart }: CartClientProps) {
  const [items, setItems] = useState(initialCart.items);
  const [loadingItem, setLoadingItem] = useState<number | null>(null);

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  async function updateQuantity(itemId: number, newQuantity: number) {
    if (newQuantity < 1) return;

    const previousItems = items;

    // Update UI immediately
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item,
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

        // Roll back UI if database update failed
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

  async function removeItem(itemId: number) {
    const previousItems = items;

    // Remove immediately from UI
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

        // Restore if deletion failed
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

  if (items.length === 0) {
    return <p>Your cart is empty.</p>;
  }

  return (
    <div className="w-full max-w-4xl space-y-6">
      {items.map((item) => (
        <div key={item.id} className="flex gap-6 border-b pb-6">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="w-24 h-24 object-cover rounded"
          />

          <div className="flex-1">
            <h2 className="font-semibold text-lg">{item.product.name}</h2>

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

        <span>₦{total.toLocaleString()}</span>
      </div>

      <button
        type="button"
        className="w-full py-3 rounded-md bg-black text-white"
      >
        Proceed to Checkout
      </button>
    </div>
  );
}
