import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Categories from "@/components/Categories";
import PromoBanner from "@/components/PromoBanner";
import TodaysDeals from "@/components/TodaysDeals";
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

  const categories = [...new Set(products.map((product) => product.category))];

  return (
    <main className="py-8  pb-30 ">
      <Header />
      <Categories categories={categories} />

      <PromoBanner />

      <TodaysDeals products={products} />
      {/* <AdSpace />
      <TodaysDeals />
      <MoreToLove /> */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 ">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <Footer />
    </main>
  );
}
