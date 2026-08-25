import Link from "next/link";
import { redirect } from "next/navigation";
import OrderFilters from "./OrderFilters";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export default async function AdminOrdersPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/login?redirect=/admin/orders");
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
          productName: true,
          quantity: true,
          price: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const ordersForFilters = orders.map((order) => ({
    id: order.id,
    customer: {
      name: order.user.name,
      email: order.user.email,
    },
    items: order.items.map((item) => ({
      id: item.id,
      productName: item.productName,
      quantity: item.quantity,
    })),
    total: order.total,
    paymentStatus: order.paymentStatus,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Orders</h1>

            <p className="mt-2 text-gray-500">
              Manage customer orders and fulfillment status.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-100"
          >
            Back to Store
          </Link>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Orders" value={orders.length} />

          <StatCard
            title="Pending Payment"
            value={
              orders.filter((order) => order.paymentStatus === "PENDING").length
            }
          />

          <StatCard
            title="Paid Orders"
            value={
              orders.filter((order) => order.paymentStatus === "PAID").length
            }
          />

          <StatCard
            title="Delivered"
            value={
              orders.filter((order) => order.status === "DELIVERED").length
            }
          />
        </div>

        {/* Orders */}
        <div className="overflow-hidden rounded-lg border bg-white">
          <div className="border-b p-6">
            <h2 className="text-xl font-semibold">All Orders</h2>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No orders found.
            </div>
          ) : (
            // <div className="overflow-x-auto">
            //   <table className="w-full min-w-[900px]">
            //     <thead className="border-b bg-gray-50">
            //       <tr className="text-left text-sm text-gray-500">
            //         <th className="px-6 py-4 font-medium">Order</th>

            //         <th className="px-6 py-4 font-medium">Customer</th>

            //         <th className="px-6 py-4 font-medium">Items</th>

            //         <th className="px-6 py-4 font-medium">Total</th>

            //         <th className="px-6 py-4 font-medium">Payment</th>

            //         <th className="px-6 py-4 font-medium">Status</th>

            //         <th className="px-6 py-4 font-medium">Date</th>

            //         <th className="px-6 py-4 font-medium">Action</th>
            //       </tr>
            //     </thead>

            //     <tbody className="divide-y">
            //       {orders.map((order) => {
            //         const itemCount = order.items.reduce(
            //           (total, item) => total + item.quantity,
            //           0,
            //         );

            //         return (
            //           <tr key={order.id} className="hover:bg-gray-50">
            //             {/* Order */}
            //             <td className="px-6 py-4">
            //               <p className="font-semibold">#{order.id}</p>
            //             </td>

            //             {/* Customer */}
            //             <td className="px-6 py-4">
            //               <p className="font-medium">{order.user.name}</p>

            //               <p className="text-sm text-gray-500">
            //                 {order.user.email}
            //               </p>
            //             </td>

            //             {/* Items */}
            //             <td className="px-6 py-4">{itemCount}</td>

            //             {/* Total */}
            //             <td className="px-6 py-4 font-semibold">
            //               ₦{order.total.toLocaleString()}
            //             </td>

            //             {/* Payment */}
            //             <td className="px-6 py-4">
            //               <PaymentBadge status={order.paymentStatus} />
            //             </td>

            //             {/* Order Status */}
            //             <td className="px-6 py-4">
            //               <StatusBadge status={order.status} />
            //             </td>

            //             {/* Date */}
            //             <td className="px-6 py-4 text-sm text-gray-500">
            //               {order.createdAt.toLocaleDateString("en-NG", {
            //                 year: "numeric",
            //                 month: "short",
            //                 day: "numeric",
            //               })}
            //             </td>

            //             {/* Action */}
            //             <td className="px-6 py-4">
            //               <Link
            //                 href={`/admin/orders/${order.id}`}
            //                 className="font-medium text-blue-600 hover:underline"
            //               >
            //                 Manage
            //               </Link>
            //             </td>
            //           </tr>
            //         );
            //       })}
            //     </tbody>
            //   </table>
            // </div>

            <section className="overflow-hidden rounded-xl border bg-white">
              <OrderFilters orders={ordersForFilters} />

              {orders.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No orders yet.
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-lg border bg-white p-6">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    PROCESSING: "bg-indigo-100 text-indigo-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    OUT_FOR_DELIVERY: "bg-orange-100 text-orange-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        styles[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}
