/* eslint-disable max-len */
'use client';

import { Card, Container, Button, Form, Row, Col } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import EditProfileModal from './EditProfileModal';

interface ProfileProps {
  user: string;
  budget: number | null;
}

export default function ProfilePageClient({ user, budget }: ProfileProps) {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { data: session } = useSession();
  const owner = session?.user?.email || user || '';

  return (
    <main>
      <Container className="mb-5 mt-5">
        <Card className="d-flex" style={{ width: '100%' }}>
          <Card.Header className="justify-content-center text-center align-items-center">
            <h2>My Profile</h2>
          </Card.Header>
          <Card.Body>
            <CardGroup>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Text>
                  <h3> Personal Information </h3>
                </Card.Text>
              </Card>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Title>Email Address</Card.Title>
                <Card.Text>
                  {owner || 'Email'}
                </Card.Text>
              </Card>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Title>Display Name</Card.Title>
                <Card.Text>
                  {'display name'}
                </Card.Text>
              </Card>
            </CardGroup>

            <CardGroup className="mt-2">
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Text>
                  <h3> Miscellaneous </h3>
                </Card.Text>
              </Card>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Title>Budget</Card.Title>
                <Card.Text>
                  {budget !== null ? `$${budget}` : 'None'}
                </Card.Text>
              </Card>
            </CardGroup>

            <CardGroup className="mt-2">
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Text>
                  <h3> Macro Goals </h3>
                </Card.Text>
              </Card>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Title>Protein Goal</Card.Title>
                <Card.Text>
                  {'0'}
                </Card.Text>
              </Card>
              <Card className="mt-2 p-3 shadow-sm">
                <Card.Title>Carb Goal</Card.Title>
                <Card.Text>
                  {'0'}
                </Card.Text>
              </Card>
            </CardGroup>
          </Card.Body>
          <Card.Footer>
            <Button variant="primary" onClick={() => setShowProfileModal(true)}>
              Edit Profile
            </Button>
          </Card.Footer>
        </Card>
      </Container>

      <EditProfileModal
        show={showProfileModal}
        onHide={() => setShowProfileModal(false)}
        email={owner}
      />
    </main>
  );
}