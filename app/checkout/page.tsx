import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const user = await getCurrentUser();

  // Checkout requires authentication
  if (!user) {
    redirect("/login?redirect=/checkout");
  }

  const cart = await prisma.cart.findUnique({
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

  // No cart or empty cart
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl p-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Customer information */}
        <section className="md:col-span-2 space-y-6">
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-xl font-semibold">Delivery Information</h2>

            <CheckoutForm />
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Payment</h2>

            <p className="text-gray-500">Payment options coming next.</p>
          </div>
        </section>

        {/* Order summary */}
        <aside className="h-fit rounded-lg border p-6">
          <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{item.product.name}</p>

                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>

                <p className="font-medium">
                  ₦{(item.product.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="my-6 border-t pt-6">
            <div className="flex justify-between text-lg font-bold">
              <span>Subtotal</span>

              <span>₦{subtotal.toLocaleString()}</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full rounded-md bg-black py-3 text-white"
          >
            Place Order
          </button>
        </aside>
      </div>
    </main>
  );
}
