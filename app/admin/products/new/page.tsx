// import Link from "next/link";

// import { requireAdmin } from "@/lib/admin";
// import ProductForm from "../ProductForm";

// export default async function NewProductPage() {
//   await requireAdmin();

//   return (
//     <main className="mx-auto max-w-3xl p-8">
//       <Link
//         href="/admin/products"
//         className="mb-6 inline-block text-sm text-gray-500 hover:text-black"
//       >
//         ← Back to products
//       </Link>

//       <h1 className="mb-2 text-3xl font-bold">Add Product</h1>

//       <p className="mb-8 text-gray-500">Add a new product to your store.</p>

//       <ProductForm />
//     </main>
//   );
// }

"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price,
          image,
          category,
          stock,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/products"
          className="mb-6 inline-block text-sm text-gray-500 hover:text-black"
        >
          ← Back to products
        </Link>

        <div className="rounded-xl border bg-white p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Add Product</h1>

            <p className="mt-2 text-gray-500">
              Add a new product to your store.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Product name
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="e.g. Nike Air Max"
                className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium"
              >
                Description
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={5}
                placeholder="Describe the product..."
                className="w-full resize-none rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Price + Stock */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="price"
                  className="mb-2 block text-sm font-medium"
                >
                  Price (₦)
                </label>

                <input
                  id="price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  required
                  placeholder="50000"
                  className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label
                  htmlFor="stock"
                  className="mb-2 block text-sm font-medium"
                >
                  Stock
                </label>

                <input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  required
                  placeholder="20"
                  className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium"
              >
                Category
              </label>

              <input
                id="category"
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
                placeholder="e.g. Shoes"
                className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Image */}
            <div>
              <label htmlFor="image" className="mb-2 block text-sm font-medium">
                Image URL
              </label>

              <input
                id="image"
                type="url"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                required
                placeholder="https://example.com/product.jpg"
                className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
              />

              <p className="mt-2 text-xs text-gray-500">
                For now, enter the URL of an existing product image.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex justify-end gap-3 border-t pt-6">
              <Link
                href="/admin/products"
                className="rounded-md border px-5 py-3 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {loading ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
