"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

type MoreToLoveProps = {
  products: Product[];
};

const PRODUCTS_PER_LOAD = 8;
const LOADING_TIME = 800;

export default function MoreToLove({ products }: MoreToLoveProps) {
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_LOAD);

  const [loading, setLoading] = useState(false);

  const visibleProducts = useMemo(() => {
    return products.slice(0, visibleCount);
  }, [products, visibleCount]);

  const hasMore = visibleCount < products.length;

  function handleLoadMore() {
    if (loading || !hasMore) return;

    setLoading(true);

    // Simulate loading
    setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + PRODUCTS_PER_LOAD, products.length),
      );

      setLoading(false);
    }, LOADING_TIME);
  }

  console.log("TOTAL PRODUCTS:", products.length);
  console.log("VISIBLE PRODUCTS:", visibleProducts.length);
  console.log("VISIBLE COUNT:", visibleCount);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              More to Love
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Discover more products you might like
            </p>
          </div>

          <span className="hidden text-sm text-gray-400 sm:block">
            {products.length} products
          </span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Loading animation */}
        {loading && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

              <span>Loading more products...</span>
            </div>
          </div>
        )}

        {/* Load more button */}
        {!loading && hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={loading}
              className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:border-gray-400 hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Load More
            </button>
          </div>
        )}

        {/* End message */}
        {!hasMore && products.length > PRODUCTS_PER_LOAD && (
          <p className="mt-8 text-center text-sm text-gray-400">
            You&apos;ve reached the end of the products.
          </p>
        )}
      </div>
    </section>
  );
}
