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
    select: {
      budget: true,
      proteinGoal: true,
      carbsGoal: true,
      fatGoal: true,
      caloriesGoal: true,
    },
  });

  const budget       = userData?.budget       ? Number(userData.budget)       : null;
  const proteinGoal  = userData?.proteinGoal  ?? null;
  const carbsGoal    = userData?.carbsGoal    ?? null;
  const fatGoal      = userData?.fatGoal      ?? null;
  const caloriesGoal = userData?.caloriesGoal ?? null;

  return (
    <main>
      <Container>
        <ProfilePageClient
          user={user}
          budget={budget}
          proteinGoal={proteinGoal}
          carbsGoal={carbsGoal}
          fatGoal={fatGoal}
          caloriesGoal={caloriesGoal}
        />
      </Container>
    </main>
  );
};


export default ProfilePage;
