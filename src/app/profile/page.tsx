import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import ProfilePageClient from '@/components/profile/ProfilePageClient';
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container } from 'react-bootstrap';
import { prisma } from '@/lib/prisma';

const ProfilePage = async () => {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const user = session?.user?.email || '';

  const userData = await prisma.user.findUnique({
    where: { email: user },
    select: { budget: true, dietPref: true },
  });
  const budget = userData?.budget ? Number(userData.budget) : null;

  const dietPref = userData?.dietPref || [];

  return (
    <main>
      <Container>
        <ProfilePageClient
          user={user}
          budget={budget}
          dietPref={dietPref}
        />
      </Container>
    </main>
  );
};


export default ProfilePage;