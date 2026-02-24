import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const recipeId = Number(id);

    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 },
      );
    }

    if (Number.isNaN(recipeId)) {
      return NextResponse.json(
        { error: 'Invalid recipe id' },
        { status: 400 },
      );
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      select: { owner: true },
    });

    if (!recipe) {
      return NextResponse.json(
        { error: 'Recipe not found' },
        { status: 404 },
      );
    }

    const { owner: ownerField } = recipe;

    let owners: string[] = [];
    if (Array.isArray(ownerField)) {
      owners = ownerField;
    } else if (typeof ownerField === 'string') {
      owners = [ownerField];
    }

    const isAdmin = email === 'admin@foo.com';
    const isOwner = owners.includes(email);

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Not authorized to delete this recipe' },
        { status: 403 },
      );
    }

    await prisma.recipe.delete({
      where: { id: recipeId },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 },
    );
  }
}
