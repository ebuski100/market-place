// "use client";

// import { useState } from "react";

// type AddToCartButtonProps = {
//   productId: number;
//   stock: number;
// };

// export default function AddToCartButton({
//   productId,
//   stock,
// }: AddToCartButtonProps) {
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   async function handleAddToCart() {
//     try {
//       setLoading(true);
//       setMessage("");

//       const response = await fetch("/api/cart", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           productId,
//           quantity: 1,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setMessage(data.error || "Failed to add product");
//         return;
//       }

//       setMessage("Added to cart!");
//     } catch (error) {
//       console.error(error);
//       setMessage("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       <button
//         type="button"
//         onClick={handleAddToCart}
//         disabled={stock === 0 || loading}
//         className="mt-8 px-6 py-3 rounded-md bg-black text-white disabled:bg-gray-400"
//       >
//         {loading ? "Adding..." : "Add to Cart"}
//       </button>

//       {message && <p className="mt-3 text-sm">{message}</p>}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import type { Product } from "@/types/product";
import { useAuth } from "@/hooks/useAuth";
import { addToGuestCart } from "@/lib/guestCart";

type AddToCartButtonProps = {
  product: Product;
};

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    if (authLoading || loading) return;

    // Guest user
    if (!isAuthenticated) {
      addToGuestCart(product, 1);

      alert("Added to cart");
      return;
    }

    // Logged-in user
    setLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add to cart");
        return;
      }

      alert("Added to cart");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={product.stock <= 0 || authLoading || loading}
      className="mt-6 w-full rounded-md bg-black px-6 py-3 text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {product.stock <= 0
        ? "Out of Stock"
        : authLoading
          ? "Loading..."
          : loading
            ? "Adding..."
            : "Add to Cart"}
    </button>
  );
}
