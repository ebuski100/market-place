import CartClient from "@/components/CartClient";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function CartPage() {
  const user = await getCurrentUser();

  let cart = null;

  if (user) {
    cart = await prisma.cart.findUnique({
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
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center p-8">
      <h1 className="mb-8 w-full max-w-4xl text-3xl font-bold">Your Cart</h1>

      <CartClient initialCart={cart} isAuthenticated={!!user} />
    </main>
  );
}
