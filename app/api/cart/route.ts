// import { prisma } from "@/lib/prisma";
// import { getCurrentUser } from "@/lib/auth";

// export async function GET() {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     let cart = await prisma.cart.findUnique({
//       where: {
//         userId: user.id,
//       },
//       include: {
//         items: {
//           include: {
//             product: true,
//           },
//         },
//       },
//     });

//     if (!cart) {
//       cart = await prisma.cart.create({
//         data: {
//           userId: user.id,
//         },
//         include: {
//           items: {
//             include: {
//               product: true,
//             },
//           },
//         },
//       });
//     }

//     return Response.json(cart);
//   } catch (error) {
//     console.error("Failed to fetch cart:", error);

//     return Response.json({ error: "Failed to fetch cart" }, { status: 500 });
//   }
// }
// export async function POST(request: Request) {
//   try {
//     const user = await getCurrentUser();

//     if (!user) {
//       return Response.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const body = await request.json();

//     const { productId, quantity = 1 } = body;

//     if (!productId) {
//       return Response.json(
//         { error: "Product ID is required" },
//         { status: 400 },
//       );
//     }

//     // Make sure the product exists
//     const product = await prisma.product.findUnique({
//       where: {
//         id: productId,
//       },
//     });

//     if (!product) {
//       return Response.json({ error: "Product not found" }, { status: 404 });
//     }

//     // Find the logged-in user's cart
//     let cart = await prisma.cart.findUnique({
//       where: {
//         userId: user.id,
//       },
//     });

//     // Create the cart if it doesn't exist
//     if (!cart) {
//       cart = await prisma.cart.create({
//         data: {
//           userId: user.id,
//         },
//       });
//     }

//     // Check whether the product is already in the cart
//     const existingItem = await prisma.cartItem.findUnique({
//       where: {
//         cartId_productId: {
//           cartId: cart.id,
//           productId,
//         },
//       },
//     });

//     let cartItem;

//     if (existingItem) {
//       cartItem = await prisma.cartItem.update({
//         where: {
//           id: existingItem.id,
//         },
//         data: {
//           quantity: existingItem.quantity + quantity,
//         },
//         include: {
//           product: true,
//         },
//       });
//     } else {
//       cartItem = await prisma.cartItem.create({
//         data: {
//           cartId: cart.id,
//           productId,
//           quantity,
//         },
//         include: {
//           product: true,
//         },
//       });
//     }

//     return Response.json(cartItem, { status: 201 });
//   } catch (error) {
//     console.error("Failed to add to cart:", error);

//     return Response.json({ error: "Failed to add to cart" }, { status: 500 });
//   }
// }

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addToCartSchema } from "@/lib/validations/cart";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const result = addToCartSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          error: result.error.issues[0].message,
        },
        { status: 400 },
      );
    }

    const { productId, quantity } = result.data;

    // Make sure the product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock
    if (quantity > product.stock) {
      return Response.json(
        { error: "Not enough stock available" },
        { status: 400 },
      );
    }

    // Find the user's cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId: user.id,
      },
    });

    // Create cart if it doesn't exist
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Check whether product is already in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return Response.json(
          { error: "Not enough stock available" },
          { status: 400 },
        );
      }

      const updatedItem = await prisma.cartItem.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: newQuantity,
        },
        include: {
          product: true,
        },
      });

      return Response.json(updatedItem);
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    return Response.json(cartItem, { status: 201 });
  } catch (error) {
    console.error("Add to cart error:", error);

    return Response.json(
      { error: "Failed to add item to cart" },
      { status: 500 },
    );
  }
}
