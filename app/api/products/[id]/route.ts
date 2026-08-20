import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);

    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}
