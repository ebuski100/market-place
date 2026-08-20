import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    if (!email || !password) {
      return Response.json(
        {
          error: "Email and password are required",
        },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user
    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return Response.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Compare the submitted password with the hashed password
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return Response.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      );
    }

    // Create a random session ID
    const sessionId = randomBytes(32).toString("hex");

    // Session expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt,
      },
    });

    // Store session ID in an HttpOnly cookie
    const cookieStore = await cookies();

    cookieStore.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/",
    });

    return Response.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return Response.json(
      {
        error: "Failed to login",
      },
      { status: 500 },
    );
  }
}
