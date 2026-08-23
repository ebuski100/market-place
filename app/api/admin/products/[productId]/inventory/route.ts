import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type RouteContext = {
  params: Promise<{
    productId: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
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

    const quantity = Number(body.quantity);
    const type = body.type;
    const reason = body.reason?.trim() || null;

    if (!Number.isInteger(quantity) || quantity === 0) {
      return NextResponse.json(
        { error: "Quantity must be a non-zero integer" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "RESTOCK",
      "ADJUSTMENT",
      "DAMAGED",
      "RETURN",
      "ORDER",
    ];

    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid inventory transaction type" },
        { status: 400 },
      );
    }

    const product = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const newStock = product.stock + quantity;

    if (newStock < 0) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Current stock: ${product.stock}`,
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: {
          id,
        },
        data: {
          stock: newStock,
        },
      });

      const transaction = await tx.inventoryTransaction.create({
        data: {
          productId: id,
          quantity,
          type,
          reason,
        },
      });

      return {
        product: updatedProduct,
        transaction,
      };
    });

    return NextResponse.json({
      message: "Inventory updated successfully",
      stock: result.product.stock,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Inventory update error:", error);

    return NextResponse.json(
      { error: "Failed to update inventory" },
      { status: 500 },
    );
  }
}
