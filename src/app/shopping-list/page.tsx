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

  // --- add protein totals + convert Decimal → number ---
  const shoppingListsWithProtein = shoppingLists.map((list: { items: any[]; }) => {
    const items = list.items.map((item) => ({
      ...item,
      price: item.price ? Number(item.price) : null,
    }));

    // const totalProtein = items.reduce((sum, item) => {
    //   const protein = item.proteinG ?? 0;
    //   return sum + protein * item.quantity;
    // }, 0);

    const totalProtein = list.items.reduce(
      (sum: number, item: { proteinG: any; quantity: number }) =>
        sum + (item.proteinG ? Number(item.proteinG) * item.quantity : 0),
      0
    );

    return {
      ...list,
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