import { prisma } from "@/lib/prisma";

type RouteParams = {
  params: Promise<{
    itemId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { itemId } = await params;

    const id = Number(itemId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid cart item ID" }, { status: 400 });
    }

    const body = await request.json();
    const quantity = Number(body.quantity);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return Response.json(
        { error: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      return Response.json({ error: "Cart item not found" }, { status: 404 });
    }

    if (quantity > cartItem.product.stock) {
      return Response.json(
        { error: "Not enough stock available" },
        { status: 400 },
      );
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id,
      },
      data: {
        quantity,
      },
      include: {
        product: true,
      },
    });

    return Response.json(updatedItem);
  } catch (error) {
    console.error("Error updating cart item:", error);

    return Response.json(
      { error: "Failed to update cart item" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { itemId } = await params;

    const id = Number(itemId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid cart item ID" }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        id,
      },
    });

    if (!cartItem) {
      return Response.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: {
        id,
      },
    });

    return Response.json({
      message: "Cart item removed",
    });
  } catch (error) {
    console.error("Error removing cart item:", error);

    return Response.json(
      { error: "Failed to remove cart item" },
      { status: 500 },
    );
  }
}
