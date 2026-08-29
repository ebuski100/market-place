import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetails from "./ProductDetails";

type ProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { productId } = await params;
  console.log("PRODUCT ID FROM URL:", productId);

  const id = Number(productId);
  console.log("CONVERTED ID:", id);

  if (!Number.isInteger(id)) {
    console.log("INVALID PRODUCT ID");

    notFound();
  }

  const product = await prisma.product.findUnique({
    where: {
      id,
      isActive: true,
    },
  });

  if (!product) {
    console.log("PRODUCT NOT FOUND IN DATABASE");

    notFound();
  }

  return <ProductDetails product={product} />;
}
