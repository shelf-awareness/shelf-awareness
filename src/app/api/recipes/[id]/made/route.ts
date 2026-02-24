import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const recipeId = Number(id);

    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (Number.isNaN(recipeId)) {
      return NextResponse.json({ error: "Invalid recipe id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const usage = await prisma.recipeUsage.upsert({
      where: { userId_recipeId: { userId: user.id, recipeId } },
      create: { userId: user.id, recipeId, count: 1, lastUsedAt: new Date() },
      update: { count: { increment: 1 }, lastUsedAt: new Date() },
      select: { count: true, lastUsedAt: true },
    });

    return NextResponse.json({
      message: "Recipe usage incremented",
      count: usage.count,
      lastUsedAt: usage.lastUsedAt,
    });
  } catch (error) {
    console.error("Error incrementing recipe usage:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }
}
