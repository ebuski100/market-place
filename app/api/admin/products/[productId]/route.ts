import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

// --------------------------------------------------
// GET /api/admin/products/[productId]
// --------------------------------------------------

export async function GET(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = await params;

    const id = Number(productId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error("Get admin product error:", error);

    return Response.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

// --------------------------------------------------
// PATCH /api/admin/products/[productId]
// --------------------------------------------------

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = await params;

    const id = Number(productId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();

    const { name, description, price, image, category, stock } = body;

    // --------------------------------------------------
    // Validate required fields
    // --------------------------------------------------

    if (
      !name ||
      !description ||
      !image ||
      !category ||
      price === undefined ||
      stock === undefined
    ) {
      return Response.json(
        { error: "All product fields are required" },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return Response.json({ error: "Invalid price" }, { status: 400 });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return Response.json(
        { error: "Invalid stock quantity" },
        { status: 400 },
      );
    }

    // --------------------------------------------------
    // Check product exists
    // --------------------------------------------------

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // --------------------------------------------------
    // Update product
    // --------------------------------------------------

    const product = await prisma.product.update({
      where: {
        id,
      },
      data: {
        name: String(name).trim(),
        description: String(description).trim(),
        price: numericPrice,
        image: String(image).trim(),
        category: String(category).trim(),
        stock: numericStock,
      },
    });

    return Response.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update admin product error:", error);

    return Response.json(
      { error: "Failed to update product" },
      { status: 500 },
    );
  }
}

// --------------------------------------------------
// DELETE /api/admin/products/[productId]
// --------------------------------------------------

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const { productId } = await params;

    const id = Number(productId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return Response.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin product error:", error);

    return Response.json(
      {
        error:
          "Failed to delete product. It may be referenced by existing orders.",
      },
      { status: 500 },
    );
  }
}
