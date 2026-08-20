import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const cart = await prisma.cart.findFirst({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return Response.json({
        id: null,
        items: [],
      });
    }

    return Response.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);

    return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const productId = Number(body.productId);
    const quantity = Number(body.quantity);

    if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
      return Response.json(
        { error: "productId and quantity must be integers" },
        { status: 400 },
      );
    }

    if (quantity < 1) {
      return Response.json(
        { error: "Quantity must be at least 1" },
        { status: 400 },
      );
    }

    // Find the product
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock
    if (product.stock < quantity) {
      return Response.json(
        { error: "Not enough stock available" },
        { status: 400 },
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    let cartItem;

    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: existingItem.quantity + quantity,
        },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return Response.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Error adding product to cart:", error);

    return Response.json(
      { error: "Failed to add product to cart" },
      { status: 500 },
    );
  }
}
