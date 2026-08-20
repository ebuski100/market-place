import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        {
          error: "Name, email and password are required",
        },
        { status: 400 },
      );
    }

    // Basic password validation
    if (password.length < 6) {
      return Response.json(
        {
          error: "Password must be at least 6 characters",
        },
        { status: 400 },
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return Response.json(
        {
          error: "A user with this email already exists",
        },
        { status: 409 },
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and cart together
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,

        cart: {
          create: {},
        },
      },

      // Don't return password to the client
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        message: "User registered successfully",
        user,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    return Response.json(
      {
        error: "Failed to register user",
      },
      { status: 500 },
    );
  }
}
