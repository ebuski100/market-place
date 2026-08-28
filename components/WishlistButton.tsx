// "use client";

// import { useState } from "react";
// import { toast } from "sonner";

// import { useStoreCounts } from "@/lib/store/useStoreCounts";

// type WishlistButtonProps = {
//   productId: number;
// };

// export default function WishlistButton({ productId }: WishlistButtonProps) {
//   const wishlistProductIds = useStoreCounts(
//     (state) => state.wishlistProductIds,
//   );

//   const addWishlistProduct = useStoreCounts(
//     (state) => state.addWishlistProduct,
//   );

//   const removeWishlistProduct = useStoreCounts(
//     (state) => state.removeWishlistProduct,
//   );

//   const [loading, setLoading] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);

//   const isWishlisted = wishlistProductIds.includes(productId);

//   async function handleWishlist() {
//     if (loading) return;

//     setLoading(true);
//     setIsAnimating(true);

//     try {
//       /*
//        * REMOVE
//        */
//       if (isWishlisted) {
//         const response = await fetch(`/api/wishlist/${productId}`, {
//           method: "DELETE",
//         });

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.error || "Failed to remove from wishlist");
//         }

//         removeWishlistProduct(productId);

//         toast("Removed from wishlist", {
//           style: {
//             background: "#fef2f2",
//             border: "1px solid #fecaca",
//             color: "#dc2626",
//           },
//         });

//         return;
//       }

//       /*
//        * ADD
//        */
//       const response = await fetch("/api/wishlist", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productId,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to add to wishlist");
//       }

//       addWishlistProduct(productId);

//       toast.success("Added to wishlist");
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "Something went wrong",
//       );
//     } finally {
//       setLoading(false);

//       setTimeout(() => {
//         setIsAnimating(false);
//       }, 300);
//     }
//   }

//   return (
//     <button
//       type="button"
//       onClick={handleWishlist}
//       disabled={loading}
//       aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
//       className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition-transform duration-150 hover:scale-105 active:scale-90 disabled:cursor-not-allowed disabled:opacity-70"
//     >
//       {loading ? (
//         <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
//       ) : (
//         <svg
//           viewBox="0 0 24 24"
//           fill={isWishlisted ? "currentColor" : "none"}
//           stroke="currentColor"
//           strokeWidth="1.8"
//           className={`h-5 w-5 ${
//             isWishlisted ? "text-red-500" : "text-gray-700"
//           } ${isAnimating ? "wishlist-pop" : ""}`}
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
//           />
//         </svg>
//       )}
//     </button>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useWishlistStore } from "@/lib/store/useWishlistStore";
import { useStoreCounts } from "@/lib/store/useStoreCounts";

type WishlistButtonProps = {
  productId: number;
};

export default function WishlistButton({ productId }: WishlistButtonProps) {
  const { initialized, loadWishlist, isWishlisted, addItem, removeItem } =
    useWishlistStore();

  const { setWishlistCount } = useStoreCounts();

  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  /*
   * Load wishlist once.
   */
  useEffect(() => {
    if (!initialized) {
      loadWishlist();
    }
  }, [initialized, loadWishlist]);

  /*
   * Keep badge synchronized with wishlist items.
   */
  const wishlisted = isWishlisted(productId);

  useEffect(() => {
    setWishlistCount(useWishlistStore.getState().items.length);
  }, [wishlisted, setWishlistCount]);

  async function handleWishlist() {
    if (loading) return;

    setLoading(true);
    setIsAnimating(true);

    try {
      if (wishlisted) {
        await removeItem(productId);

        toast("Removed from wishlist", {
          style: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
          },
        });
      } else {
        await addItem(productId);

        toast.success("Added to wishlist");
      }

      /*
       * Update footer badge using the actual
       * Zustand wishlist state.
       */
      setWishlistCount(useWishlistStore.getState().items.length);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setLoading(false);

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    }
  }

  return (
    <button
      type="button"
      onClick={handleWishlist}
      disabled={loading || !initialized}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur transition-transform duration-150 hover:scale-105 active:scale-90 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading || !initialized ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill={wishlisted ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
          className={`h-5 w-5 ${
            wishlisted ? "text-red-500" : "text-gray-700"
          } ${isAnimating ? "wishlist-pop" : ""}`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
          />
        </svg>
      )}
    </button>
  );
}
