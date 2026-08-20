import Link from "next/link";
import type { Product } from "@/types/product";

type ProductCardProps = {
  product: Product;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="border rounded-lg overflow-hidden">
      <div className="aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[50px] "
        />
      </div>

      <div className="p-4">
        <p className="text-sm text-gray-500 capitalize">{product.category}</p>

        <h2 className="text-xl font-semibold mt-1">{product.name}</h2>

        <p className="text-gray-600 mt-2">{product.description}</p>

        <div className="flex items-center justify-between mt-4">
          <p className="font-bold">₦{product.price.toLocaleString()}</p>

          <Link
            href={`/products/${product.id}`}
            className="px-4 py-2 rounded-md bg-black text-white"
          >
            View
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
        </p>
      </div>
    </article>
  );
}
