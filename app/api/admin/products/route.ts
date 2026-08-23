// import { prisma } from "@/lib/prisma";
// import { requireAdmin } from "@/lib/admin";

// export async function GET() {
//   try {
//     await requireAdmin();

//     const products = await prisma.product.findMany({
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     return Response.json({
//       products,
//     });
//   } catch (error) {
//     console.error("Admin products GET error:", error);

//     return Response.json(
//       {
//         error:
//           error instanceof Error ? error.message : "Failed to fetch products",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

// export async function POST(request: Request) {
//   try {
//     await requireAdmin();

//     const body = await request.json();

//     const { name, description, price, image, category, stock } = body;

//     if (!name || !description || !image || !category) {
//       return Response.json(
//         {
//           error: "All product fields are required",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const parsedPrice = Number(price);
//     const parsedStock = Number(stock);

//     if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
//       return Response.json(
//         {
//           error: "Invalid product price",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     if (!Number.isInteger(parsedStock) || parsedStock < 0) {
//       return Response.json(
//         {
//           error: "Invalid stock quantity",
//         },
//         {
//           status: 400,
//         },
//       );
//     }

//     const product = await prisma.product.create({
//       data: {
//         name: name.trim(),
//         description: description.trim(),
//         price: Math.round(parsedPrice),
//         image: image.trim(),
//         category: category.trim(),
//         stock: parsedStock,
//       },
//     });

//     return Response.json(
//       {
//         message: "Product created successfully",
//         product,
//       },
//       {
//         status: 201,
//       },
//     );
//   } catch (error) {
//     console.error("Admin product creation error:", error);

//     return Response.json(
//       {
//         error:
//           error instanceof Error ? error.message : "Failed to create product",
//       },
//       {
//         status: 500,
//       },
//     );
//   }
// }

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const { name, description, price, image, category, stock } = body;

    // Basic validation
    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof image !== "string" ||
      !image.trim() ||
      typeof category !== "string" ||
      !category.trim()
    ) {
      return Response.json(
        { error: "All product fields are required" },
        { status: 400 },
      );
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      return Response.json({ error: "Invalid product price" }, { status: 400 });
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
      return Response.json(
        { error: "Invalid stock quantity" },
        { status: 400 },
      );
    }

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: Math.round(numericPrice),
        image: image.trim(),
        category: category.trim(),
        stock: numericStock,
      },
    });

    return Response.json(
      {
        message: "Product created successfully",
        product,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Create product error:", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create product",
      },
      { status: 500 },
    );
  }
}
