import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { UserRole } from "@/lib/generated/prisma/client";
export default async function AdminCustomersPage() {
  await requireAdmin();

  const customers = await prisma.user.findMany({
    where: {
      role: UserRole.CUSTOMER,
    },
    include: {
      orders: {
        select: {
          id: true,
          total: true,
          paymentStatus: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customersWithStats = customers.map((customer) => {
    const paidOrders = customer.orders.filter(
      (order) => order.paymentStatus === "PAID",
    );

    const totalSpent = paidOrders.reduce((sum, order) => sum + order.total, 0);

    return {
      ...customer,
      orderCount: customer.orders.length,
      totalSpent,
    };
  });

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Customers</h1>

            <p className="mt-2 text-gray-500">
              Manage your customers and view their order history.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-md border bg-white px-5 py-3 text-sm font-medium hover:bg-gray-50"
          >
            ← Dashboard
          </Link>
        </div>

        {/* Summary */}
        <section className="mb-8 grid gap-5 sm:grid-cols-2">
          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm font-medium text-gray-500">Total Customers</p>

            <p className="mt-2 text-3xl font-bold">{customers.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <p className="text-sm font-medium text-gray-500">
              Customers With Orders
            </p>

            <p className="mt-2 text-3xl font-bold">
              {
                customers.filter((customer) => customer.orders.length > 0)
                  .length
              }
            </p>
          </div>
        </section>

        {/* Customers table */}
        <section className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Orders
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Total Spent
                  </th>

                  <th className="px-6 py-4 text-left text-sm font-semibold">
                    Joined
                  </th>

                  <th className="px-6 py-4 text-right text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {customersWithStats.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">
                          {customer.name || "Unnamed Customer"}
                        </p>

                        <p className="text-sm text-gray-500">
                          {customer.email}
                        </p>
                      </div>
                    </td>

                    {/* Orders */}
                    <td className="px-6 py-4">{customer.orderCount}</td>

                    {/* Total spent */}
                    <td className="px-6 py-4 font-medium">
                      ₦{customer.totalSpent.toLocaleString("en-NG")}
                    </td>

                    {/* Joined */}
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.createdAt.toLocaleDateString("en-NG")}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="font-medium underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {customers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No customers yet.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
