"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
};

type EditProductFormProps = {
  product: Product;
};

export default function EditProductForm({ product }: EditProductFormProps) {
  const router = useRouter();

  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [category, setCategory] = useState(product.category);
  const [image, setImage] = useState(product.image);
  const [stock, setStock] = useState(String(product.stock));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          price,
          category,
          image,
          stock,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update product");
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border bg-white p-8"
    >
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium">
          Product Name
        </label>

        <input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded-md border px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      {/* Price */}
      <div>
        <label htmlFor="price" className="mb-2 block text-sm font-medium">
          Price
        </label>

        <input
          id="price"
          type="number"
          min="0"
          step="1"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          className="w-full rounded-md border px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="mb-2 block text-sm font-medium">
          Category
        </label>

        <input
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded-md border px-4 py-3 outline-none focus:border-black"
          required
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
          className="w-full rounded-md border px-4 py-3 outline-none focus:border-black"
          required
        />

        {image && (
          <div className="mt-4">
            <img
              src={image}
              alt={name}
              className="h-40 w-40 rounded-lg border object-cover"
            />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium">
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={6}
          className="w-full resize-none rounded-md border px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      {/* Stock */}
      <div>
        <label htmlFor="stock" className="mb-2 block text-sm font-medium">
          Stock
        </label>

        <input
          id="stock"
          type="number"
          min="0"
          step="1"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          className="w-full rounded-md border px-4 py-3 outline-none focus:border-black"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4 border-t pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-black px-6 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="rounded-md border px-6 py-3 font-medium transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
