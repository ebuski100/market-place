import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type OrderPageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/orders");
  }

  const { orderId } = await params;

  const id = Number(orderId);

  if (Number.isNaN(id)) {
    notFound();
  }

  /*
   * IMPORTANT:
   * We check both the order ID AND user ID.
   *
   * This prevents one customer from accessing
   * another customer's order by changing the URL.
   */
  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl p-8">
      {/* Back */}
      <Link
        href="/orders"
        className="mb-6 inline-block text-sm text-gray-500 hover:text-black"
      >
        ← Back to orders
      </Link>

      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.id}</h1>

          <p className="mt-2 text-sm text-gray-500">
            Placed{" "}
            {order.createdAt.toLocaleDateString("en-NG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              order.paymentStatus === "PAID"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.paymentStatus}
          </span>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main content */}
        <section className="space-y-8 md:col-span-2">
          {/* Order Status */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-xl font-semibold">Order Status</h2>

            <OrderTimeline status={order.status} />
          </div>

          {/* Items */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-xl font-semibold">Items</h2>

            <div className="space-y-6">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-4 border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{item.productName}</p>

                    <p className="mt-1 text-sm text-gray-500">
                      ₦{item.price.toLocaleString()} × {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-xl font-semibold">Delivery Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Recipient</p>

                <p className="font-medium">{order.fullName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Phone</p>

                <p className="font-medium">{order.phone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>

                <p className="font-medium">{order.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Location</p>

                <p className="font-medium">
                  {order.city}, {order.state}, {order.country}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Delivery method</p>

                <p className="font-medium capitalize">{order.deliveryMethod}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <aside className="h-fit rounded-lg border p-6">
          <h2 className="mb-6 text-xl font-semibold">Order Summary</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>

              <span>₦{order.subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>

              <span>
                {order.deliveryFee === 0
                  ? "Free"
                  : `₦${order.deliveryFee.toLocaleString()}`}
              </span>
            </div>

            <div className="flex justify-between border-t pt-4 text-lg font-bold">
              <span>Total</span>

              <span>₦{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="mt-6 border-t pt-6">
            <p className="text-sm text-gray-500">Payment status</p>

            <p className="mt-1 font-semibold">{order.paymentStatus}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

/**
 * Order status timeline
 */
function OrderTimeline({ status }: { status: string }) {
  const steps = [
    {
      id: "PENDING",
      label: "Order placed",
    },
    {
      id: "CONFIRMED",
      label: "Order confirmed",
    },
    {
      id: "PROCESSING",
      label: "Processing",
    },
    {
      id: "SHIPPED",
      label: "Shipped",
    },
    {
      id: "OUT_FOR_DELIVERY",
      label: "Out for delivery",
    },
    {
      id: "DELIVERED",
      label: "Delivered",
    },
  ];

  const currentIndex = steps.findIndex((step) => step.id === status);

  return (
    <div className="space-y-5">
      {steps.map((step, index) => {
        const completed = currentIndex >= index;

        const current = step.id === status;

        return (
          <div key={step.id} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  completed
                    ? "bg-black text-white"
                    : "border bg-white text-gray-400"
                }`}
              >
                {completed ? "✓" : index + 1}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mt-1 h-8 w-px ${
                    currentIndex > index ? "bg-black" : "bg-gray-200"
                  }`}
                />
              )}
            </div>

            <div>
              <p
                className={`font-medium ${
                  current
                    ? "text-black"
                    : completed
                      ? "text-gray-700"
                      : "text-gray-400"
                }`}
              >
                {step.label}
              </p>

              {current && (
                <p className="mt-1 text-sm text-gray-500">Current status</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
