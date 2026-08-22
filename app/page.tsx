import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default async function HomePage() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products`,
    {
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const products: Product[] = await response.json();

  return (
    <main className="p-8 pb-30">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Footer />
    </main>
  );
}
