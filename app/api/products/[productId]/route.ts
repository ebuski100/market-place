// import { prisma } from "@/lib/prisma";

// type RouteParams = {
//   params: Promise<{
//     id: string;
//   }>;
// };

// export async function GET(request: Request, { params }: RouteParams) {
//   try {
//     const { id } = await params;

//     const productId = Number(id);

//     if (Number.isNaN(productId)) {
//       return Response.json({ error: "Invalid product ID" }, { status: 400 });
//     }

//     const product = await prisma.product.findUnique({
//       where: {
//         id: productId,
//       },
//     });

//     if (!product) {
//       return Response.json({ error: "Product not found" }, { status: 404 });
//     }

//     return Response.json(product);
//   } catch (error) {
//     console.error("Error fetching product:", error);

//     return Response.json({ error: "Failed to fetch product" }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { productId } = await params;
    const id = Number(productId);

    if (!Number.isInteger(id)) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { name, price, description, category, image, stock } = body;

    // Validate required fields
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }

    if (typeof description !== "string" || !description.trim()) {
      return NextResponse.json(
        { error: "Product description is required" },
        { status: 400 },
      );
    }

    if (typeof category !== "string" || !category.trim()) {
      return NextResponse.json(
        { error: "Product category is required" },
        { status: 400 },
      );
    }

    if (typeof image !== "string" || !image.trim()) {
      return NextResponse.json(
        { error: "Product image is required" },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return NextResponse.json(
        { error: "Invalid product price" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return NextResponse.json(
        { error: "Stock must be a non-negative integer" },
        { status: 400 },
      );
    }

    // Make sure the product exists
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update product
    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        image: image.trim(),
        price: numericPrice,
        stock: numericStock,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Admin product update error:", error);

    return NextResponse.json(
      {
        error: "Failed to update product",
      },
      {
        status: 500,
      },
    );
  }
}
