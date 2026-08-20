// import CartClient from "@/components/CartClient";

// import type { Cart } from "@/types/cart";

// import { prisma } from "@/lib/prisma";
// import { getCurrentUser } from "@/lib/auth";

// export default async function CartPage() {
//   const user = await getCurrentUser();

//   if (!user) {
//     return (
//       <main className="flex min-h-screen items-center justify-center">
//         <p>Please log in to view your cart.</p>
//       </main>
//     );
//   }

//   let cart = await prisma.cart.findUnique({
//     where: {
//       userId: user.id,
//     },
//     include: {
//       items: {
//         include: {
//           product: true,
//         },
//       },
//     },
//   });

//   if (!cart) {
//     cart = await prisma.cart.create({
//       data: {
//         userId: user.id,
//       },
//       include: {
//         items: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });
//   }

//   const total = cart.items.reduce(
//     (sum, item) => sum + item.product.price * item.quantity,
//     0,
//   );

//   return (
//     <main className="flex min-h-screen w-full flex-col items-center p-8">
//       <h1 className="w-full max-w-4xl text-3xl font-bold mb-8">Your Cart</h1>

//       <CartClient initialCart={cart} />
//     </main>
//   );
// }

import CartClient from "@/components/CartClient";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function CartPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex min-h-screen w-full items-center justify-center">
        <p>Please log in to view your cart.</p>
      </main>
    );
  }

  let cart = await prisma.cart.findUnique({
    where: {
      userId: user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  // Create a cart for the user if one doesn't exist
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-8">
      <h1 className="mb-8 w-full max-w-4xl text-3xl font-bold">Your Cart</h1>

      <CartClient initialCart={cart} />
    </main>
  );
}
