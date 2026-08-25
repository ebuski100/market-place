"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/types/product";

type AddToCartIconProps = {
  product: Product;
};

export default function AddToCartIcon({ product }: AddToCartIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  function handleAddToCart() {
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    // Trigger animation
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 350);

    // Temporary — we'll connect this to your cart API
    console.log("Adding to cart:", product.id);

    toast.success(`${product.name} added to cart`);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      aria-label={`Add ${product.name} to cart`}
      className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-2 shadow-md transition-transform duration-150 hover:scale-105 active:scale-90"
    >
      <img
        src="/cart.png"
        alt=""
        className={`h-full w-full object-contain ${
          isAnimating ? "cart-pop" : ""
        }`}
      />
    </button>
  );
}
