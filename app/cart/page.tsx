// import type { Product } from "@/types/product";
// import CartItemControls from "@/components/CartItemControls";
// type CartItem = {
//   id: number;
//   quantity: number;
//   product: Product;
// };

// type Cart = {
//   id: number | null;
//   items: CartItem[];
// };

// async function getCart(): Promise<Cart> {
//   const response = await fetch("http://localhost:3000/api/cart", {
//     cache: "no-store",
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch cart");
//   }

//   return response.json();
// }

// export default async function CartPage() {
//   const cart = await getCart();

//   const total = cart.items.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0,
//   );

//   return (
//     <main className="flex items-center flex-col w-full min-h-screen  p-8 ">
//       <h1 className="text-3xl font-bold mb-8 flex  justify-start p-2 border w-full max-w-4xl ">
//         Your Cart
//       </h1>

//       {cart.items.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <div className="space-y-6 border w-full lg:max-w-4xl md:max-w-2xl">
//           {cart.items.map((item) => (
//             <div key={item.id} className="flex gap-6 border-b pb-6">
//               <img
//                 src={item.product.image}
//                 alt={item.product.name}
//                 className="w-24 h-24 object-cover rounded"
//               />

//               <div className="flex-1">
//                 <h2 className="font-semibold text-lg">{item.product.name}</h2>

//                 <p className="text-gray-500">
//                   ₦{item.product.price.toLocaleString()}
//                 </p>

//                 {/* <p className="mt-2">Quantity: {item.quantity}</p> */}
//                 <CartItemControls itemId={item.id} quantity={item.quantity} />
//               </div>

//               <p className="font-semibold">
//                 ₦{(item.product.price * item.quantity).toLocaleString()}
//               </p>
//             </div>
//           ))}

//           <div className="flex justify-between text-xl font-bold">
//             <span>Total</span>

//             <span>₦{total.toLocaleString()}</span>
//           </div>
//         </div>
//       )}
//       <button
//         type="button"
//         className="w-full rounded-full  cursor-pointer py-4 md:max-w-2xl lg:max-w-4xl  bg-black text-white mt-10"
//       >
//         Proceed to Checkout
//       </button>
//     </main>
//   );
// }

import CartClient from "@/components/CartClient";

import type { Cart } from "@/types/cart";

async function getCart(): Promise<Cart> {
  const response = await fetch("http://localhost:3000/api/cart", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }

  return response.json();
}

export default async function CartPage() {
  const cart = await getCart();

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-8">
      <h1 className="w-full max-w-4xl text-3xl font-bold mb-8">Your Cart</h1>

      <CartClient initialCart={cart} />
    </main>
  );
}
