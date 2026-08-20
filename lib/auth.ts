import { cookies } from "next/headers";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const cookieStore = await cookies();

  const sessionId = cookieStore.get("sessionId")?.value;

  if (!sessionId) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      id: sessionId,
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    return null;
  }

  // Check whether the session has expired
  if (session.expiresAt < new Date()) {
    // Delete expired session
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  return session.user;
}
