/* eslint-disable max-len */
'use client';

import { Card, Container, Button, CardGroup } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import EditProfileModal from './EditProfileModal';
import { prisma } from '@/lib/prisma';

interface ProfileProps {
    user: string;
}


export default function ProfilePageClient({ user }: ProfileProps) {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const { data: session } = useSession();
    const owner = session?.user?.email || user || 'Unknown User';

    const [budget, setBudget] = useState<number | null>(null);

    useEffect(() => {
        const fetchBudget = async () => {
            try {
                const response = await fetch(`/api/user/budget?email=${owner}`);
                const data = await response.json();
                setBudget(data.budget);
            } catch (error) {
                console.error('Failed to fetch budget:', error);
            }
        };
        fetchBudget();
    }, [owner]);

  return (
    <main>
        <Container className="mb-5 mt-5">
                <Card className="d-flex" style={{width: '100%'}}>
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
                                            {budget !== null ? `$${budget}` : 'Loading...'}
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

        <EditProfileModal show={showProfileModal} onHide={() => setShowProfileModal(false)} email={owner} />
    </main>
  );
}