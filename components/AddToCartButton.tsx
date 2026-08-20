"use client";

import { useState } from "react";

type AddToCartButtonProps = {
  productId: number;
  stock: number;
};

export default function AddToCartButton({
  productId,
  stock,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAddToCart() {
    try {
      setLoading(true);
      setMessage("");

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to add product");
        return;
      }

      setMessage("Added to cart!");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={stock === 0 || loading}
        className="mt-8 px-6 py-3 rounded-md bg-black text-white disabled:bg-gray-400"
      >
        {loading ? "Adding..." : "Add to Cart"}
      </button>

      {message && <p className="mt-3 text-sm">{message}</p>}
    </div>
  );
}
