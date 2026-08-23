// import { prisma } from "@/lib/prisma";

// export default async function AdminDashboard() {
//   const [totalOrders, pendingOrders, paidOrders, totalProducts, totalUsers] =
//     await Promise.all([
//       prisma.order.count(),

//       prisma.order.count({
//         where: {
//           status: "PENDING",
//         },
//       }),

//       prisma.order.count({
//         where: {
//           paymentStatus: "PAID",
//         },
//       }),

//       prisma.product.count(),

//       prisma.user.count(),
//     ]);

//   const revenue = await prisma.order.aggregate({
//     where: {
//       paymentStatus: "PAID",
//     },
//     _sum: {
//       total: true,
//     },
//   });

//   const totalRevenue = revenue._sum.total ?? 0;

//   return (
//     <main className="min-h-screen bg-gray-50 p-8">
//       <div className="mx-auto max-w-7xl">
//         <div className="mb-8">
//           <h1 className="text-3xl font-bold">Admin Dashboard</h1>

//           <p className="mt-2 text-gray-500">Manage your ecommerce store.</p>
//         </div>

//         <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//           <StatCard title="Total Orders" value={totalOrders.toLocaleString()} />

//           <StatCard
//             title="Pending Orders"
//             value={pendingOrders.toLocaleString()}
//           />

//           <StatCard title="Paid Orders" value={paidOrders.toLocaleString()} />

//           <StatCard title="Products" value={totalProducts.toLocaleString()} />

//           <StatCard title="Customers" value={totalUsers.toLocaleString()} />

//           <StatCard
//             title="Revenue"
//             value={`₦${totalRevenue.toLocaleString()}`}
//           />
//         </div>
//       </div>
//     </main>
//   );
// }

// function StatCard({ title, value }: { title: string; value: string }) {
//   return (
//     <div className="rounded-xl border bg-white p-6 shadow-sm">
//       <p className="text-sm text-gray-500">{title}</p>

//       <p className="mt-2 text-3xl font-bold">{value}</p>
//     </div>
//   );
// }

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const [
    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    paidOrders,
    revenueResult,
  ] = await Promise.all([
    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "PROCESSING",
      },
    }),

    prisma.order.count({
      where: {
        status: {
          in: ["SHIPPED", "OUT_FOR_DELIVERY"],
        },
      },
    }),

    prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    }),

    prisma.order.count({
      where: {
        paymentStatus: "PAID",
      },
    }),

    prisma.order.aggregate({
      where: {
        paymentStatus: "PAID",
      },
      _sum: {
        total: true,
      },
    }),
  ]);

  const revenue = revenueResult._sum.total ?? 0;

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders,
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
    },
    {
      label: "Processing",
      value: processingOrders,
    },
    {
      label: "Shipped",
      value: shippedOrders,
    },
    {
      label: "Delivered",
      value: deliveredOrders,
    },
    {
      label: "Paid Orders",
      value: paidOrders,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <p className="mt-2 text-gray-500">
              Manage your store and monitor orders.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Manage Orders
          </Link>
        </div>

        {/* Revenue */}
        <section className="mb-8 rounded-xl border bg-white p-6">
          <p className="text-sm font-medium text-gray-500">Total Revenue</p>

          <p className="mt-2 text-3xl font-bold">₦{revenue.toLocaleString()}</p>

          <p className="mt-2 text-sm text-gray-500">
            Based on successfully paid orders.
          </p>
        </section>

        {/* Statistics */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-white p-6">
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>

              <p className="mt-3 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </section>

        {/* Quick actions */}
        <section className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/orders"
              className="rounded-md border px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
              View Orders
            </Link>

            <Link
              href="/"
              className="rounded-md border px-5 py-3 text-sm font-medium hover:bg-gray-50"
            >
              View Store
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
