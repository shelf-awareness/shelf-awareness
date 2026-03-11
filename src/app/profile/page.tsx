
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import ProfilePageClient from "@/components/profile/ProfilePageClient";
import { loggedInProtectedPage } from '@/lib/page-protection';
import { Container } from 'react-bootstrap';


const ProfilePage = async () => {
  const session = await getServerSession(authOptions);
  loggedInProtectedPage(
    session as {
      user: { email: string; id: string; randomKey: string };
    } | null,
  );

  const user = session?.user?.email || '';

  return (
    <main>
      <Container> 
        <ProfilePageClient
          user={user}
         />
      </Container>
    </main>

  )
}

export default ProfilePage;