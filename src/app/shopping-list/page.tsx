import { getServerSession } from 'next-auth';
import { Container } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';
import { loggedInProtectedPage } from '@/lib/page-protection';
import authOptions from '@/lib/authOptions';
import ShoppingListClient from '@/components/shopping-list/ShoppingListClient';

type SessionUser = { id: string; email: string; randomKey: string };

const ViewShoppingListPage = async () => {
  const session = (await getServerSession(authOptions)) as { user: SessionUser } | null;
  loggedInProtectedPage(session);

  const owner = session?.user?.email || '';

  const shoppingLists = await prisma.shoppingList.findMany({
    where: { owner },
    include: {
      items: true,
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  // --- add protein totals + convert Decimal → plain number ---
  const shoppingListsWithProtein = shoppingLists.map((list) => {
    const items = list.items.map((item) => ({
      id: item.id,
      shoppingListId: item.shoppingListId,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      proteinGrams: item.proteinGrams ?? null,
      price: item.price != null ? Number(item.price.toString()) : null,
      restockTrigger: item.restockTrigger ?? null,
      customThreshold: item.customThreshold ?? null,
    }));

    const totalProtein = items.reduce(
      (sum, item) => sum + (item.proteinGrams ?? 0) * item.quantity,
      0,
    );

    return {
      id: list.id,
      name: list.name,
      owner: list.owner,
      createdAt: list.createdAt,
      items,
      totalProtein,
    };
  });

  return (
    <main>
      <Container id="view-shopping-list" className="py-3">
        <ShoppingListClient initialShoppingLists={shoppingListsWithProtein} />
      </Container>
    </main>
  );
};

export default ViewShoppingListPage;