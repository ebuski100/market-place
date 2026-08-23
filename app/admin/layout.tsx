import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-white p-6 md:block">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Admin</h1>
          <p className="mt-1 text-sm text-gray-500">{user.email}</p>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="block rounded-md px-4 py-3 hover:bg-gray-100"
          >
            Dashboard
          </Link>

          <Link
            href="/admin/orders"
            className="block rounded-md px-4 py-3 hover:bg-gray-100"
          >
            Orders
          </Link>

          <Link
            href="/admin/products"
            className="block rounded-md px-4 py-3 hover:bg-gray-100"
          >
            Products
          </Link>

          <Link
            href="/admin/customers"
            className="block rounded-md px-4 py-3 hover:bg-gray-100"
          >
            Customers
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/"
            className="block rounded-md border px-4 py-3 text-center text-sm hover:bg-gray-50"
          >
            ← Back to store
          </Link>
        </div>
      </aside>

      <main className="md:ml-64">{children}</main>
    </div>
  );
}
