"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/types/product";
import { useStoreCounts } from "@/lib/store/useStoreCounts";

type AddToCartIconProps = {
  product: Product;
};

export default function AddToCartIcon({ product }: AddToCartIconProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const { incrementCart } = useStoreCounts();

  function handleAddToCart() {
    // Prevent adding unavailable products
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    // Update cart count
    incrementCart();

    // Trigger button animation
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 350);

    // Temporary until connected to the actual cart API
    console.log("Adding to cart:", product.id);

    // Success notification
    toast.success(`${product.name} added to cart`);
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      aria-label={`Add ${product.name} to cart`}
      disabled={product.stock <= 0}
      className="
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-white
        p-2
        shadow-md
        transition-transform
        duration-150
        hover:scale-105
        active:scale-90
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      <img
        src="/cart.png"
        alt=""
        className={`
          h-full
          w-full
          object-contain
          ${isAnimating ? "cart-pop" : ""}
        `}
      />
    </button>
  );
}
