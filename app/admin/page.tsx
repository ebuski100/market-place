import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [totalOrders, pendingOrders, paidOrders, totalProducts, totalUsers] =
    await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: "PENDING",
        },
      }),

      prisma.order.count({
        where: {
          paymentStatus: "PAID",
        },
      }),

      prisma.product.count(),

      prisma.user.count(),
    ]);

  const revenue = await prisma.order.aggregate({
    where: {
      paymentStatus: "PAID",
    },
    _sum: {
      total: true,
    },
  });

  const totalRevenue = revenue._sum.total ?? 0;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <p className="mt-2 text-gray-500">Manage your ecommerce store.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Orders" value={totalOrders.toLocaleString()} />

          <StatCard
            title="Pending Orders"
            value={pendingOrders.toLocaleString()}
          />

          <StatCard title="Paid Orders" value={paidOrders.toLocaleString()} />

          <StatCard title="Products" value={totalProducts.toLocaleString()} />

          <StatCard title="Customers" value={totalUsers.toLocaleString()} />

          <StatCard
            title="Revenue"
            value={`₦${totalRevenue.toLocaleString()}`}
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
