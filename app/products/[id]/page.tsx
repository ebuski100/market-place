import { notFound } from "next/navigation";
import type { Product } from "@/types/product";
import AddToCartButton from "@/components/AddToCartButton";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const response = await fetch(`http://localhost:3000/api/products/${id}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    notFound();
  }

  const product: Product = await response.json();

  return (
    <main className="max-w-5xl mx-auto p-8">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>

          <h1 className="text-4xl font-bold mt-2">{product.name}</h1>

          <p className="text-2xl font-bold mt-6">
            ₦{product.price.toLocaleString()}
          </p>

          <p className="text-gray-600 mt-6">{product.description}</p>

          <p className="mt-6">
            {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
          </p>

          <AddToCartButton productId={product.id} stock={product.stock} />
        </div>
      </div>
    </main>
  );
}
