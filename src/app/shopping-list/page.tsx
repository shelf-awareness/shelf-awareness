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
      items: true, // ✅ matches your schema: ShoppingListItem[] relation only
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  shoppingLists.forEach((list: any) => {
    list.items.forEach((item: any) => {
      item.price = item.price?.toNumber?.() ?? item.price;
    });
  });

  return (
    <main>
      <Container id="view-shopping-list" className="py-3">
        <ShoppingListClient initialShoppingLists={shoppingLists} />
      </Container>
    </main>
  );
};

export default ViewShoppingListPage;