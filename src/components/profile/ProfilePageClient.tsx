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
        <Card className="d-flex" style={{width: '100%'}}>
          <Card.Header className="justify-content-center text-center align-items-center">
            <h2>My Profile</h2>
            </Card.Header>
              <Row>
                <Col lg={3}>
                  <Card.Body>
                    <Card className="mt-2 p-3 shadow-sm">
                      <Card.Img className="rounded-circle" src="https://img.freepik.com/free-psd/gradient-abstract-logo_23-2150689652.jpg?semt=ais_hybrid&w=740" alt="Profile Picture" />
                        <Card.Body> </Card.Body>
                    </Card>
                  </Card.Body>
                </Col>

                <Col lg={9}>
                  <h5 className="mt-2 ms-1">Profile Information</h5>
                  <Card className="m-3">
                    <Form>
                      <Row className="m-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                              value={owner || 'Email'}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Display Name</Form.Label>
                            <Form.Control
                              value={owner || 'Email'}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                      </Row>                                    
                    </Form>
                  </Card>
                  <hr />

                  <h5 className="mt-1 ms-1">Miscellaneous</h5>
                  <Card className="m-3">
                    <Form>
                      <Row className="m-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Budget</Form.Label>
                              <Form.Control
                                value={budget !== null ? `$${budget}` : 'None...'}
                                disabled
                              />
                            </Form.Group>
                        </Col>
                      </Row>                                    
                    </Form>
                  </Card>

                  <hr />
                  <h5 className="mt-1 ms-1">Macro Goals</h5>
                  <Card className="m-3">
                    <Form>
                      <Row className="m-3">
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Protein Goal</Form.Label>
                            <Form.Control
                              value={0}
                              disabled
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label>Carb Goal</Form.Label>
                              <Form.Control
                                value={0}
                                disabled
                              />
                            </Form.Group>
                        </Col>
                      </Row>                                    
                    </Form>
                  </Card>
                </Col>
              </Row>
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
