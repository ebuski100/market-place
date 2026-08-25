"use client";

import { useState } from "react";
import { toast } from "sonner";

type WishlistButtonProps = {
  productId: number;
};

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  function handleWishlist() {
    const newState = !isWishlisted;

    setIsWishlisted(newState);
    setIsAnimating(true);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);

    if (newState) {
      toast.success("Added to wishlist");
    } else {
      toast("Removed from wishlist", {
        style: {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#dc2626",
        },
      });
    }
  }

  return (
    <button
      type="button"
      onClick={handleWishlist}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition-transform duration-150 hover:scale-105 active:scale-90"
    >
      <svg
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        className={`h-5 w-5 ${
          isWishlisted ? "text-red-500" : "text-gray-700"
        } ${isAnimating ? "wishlist-pop" : ""}`}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        />
      </svg>
    </button>
  );
}
