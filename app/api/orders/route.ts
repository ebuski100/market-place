import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validations/checkout";
import { deliveryOptions } from "@/lib/delivery";
export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate checkout information
    const body = await request.json();

    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          error: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { fullName, phone, address, city, state, country, deliveryMethod } =
      result.data;

    // 3. Get user's cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return Response.json(
        {
          error: "Your cart is empty",
        },
        { status: 400 },
      );
    }

    // 4. Calculate everything on the server
    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    // Temporary delivery fee
    const selectedDelivery = deliveryOptions.find(
      (option) => option.id === deliveryMethod,
    );

    if (!selectedDelivery) {
      return Response.json(
        {
          error: "Invalid delivery method",
        },
        { status: 400 },
      );
    }

    const deliveryFee = selectedDelivery.price;
    const total = subtotal + deliveryFee;

    // 5. Create order and update stock in ONE transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const estimatedDeliveryAt = new Date();

      estimatedDeliveryAt.setDate(
        estimatedDeliveryAt.getDate() + selectedDelivery.maxDays,
      );
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,

          status: "PENDING",
          paymentStatus: "PENDING",

          subtotal,
          deliveryFee,
          total,
          deliveryMethod,
          estimatedDeliveryAt,
          fullName,
          phone,
          address,
          city,
          state,
          country,

          items: {
            create: cart.items.map((item) => ({
              productId: item.product.id,
              productName: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
            })),
          },
        },

        include: {
          items: true,
        },
      });

      return newOrder;
    });

    return Response.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create order error:", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    );
  }
}
