'use client';

import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import swal from 'sweetalert';
import '@/styles/buttons.css';

interface EditProfileModalProps {
    show: boolean;
    onHide: () => void;
    email: string;
}

export default function EditProfileModal({
    show,
    onHide,
    email,
}: EditProfileModalProps) {
    const router = useRouter();
    const [err, setErr] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setErr(null);
            setIsLoading(true);

            try {
                const res = await fetch('/api/profile/update', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({}),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to update profile');
                }

                swal('Success', 'Your profile has been updated', 'success', {
                    timer: 2000,
                });
                onHide();
                router.refresh();
            } catch (error: any) {
                setErr(error?.message ?? 'Failed to update profile');
            } finally {
                setIsLoading(false);
            }
        },
        [onHide, router],
    );

    return (
        <Modal show={show} onHide={onHide} centered backdrop="static">
            <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {err && <Alert variant="danger">{err}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" value={email} disabled />
                        <Form.Text className="text-muted">
                            Email cannot be changed
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-between mt-4">
                        <Button type="submit" className="btn-add" disabled={isLoading}>
                            {isLoading ? 'Saving…' : 'Save Changes'}
                        </Button>
                        <Button variant="secondary" type="button" onClick={onHide}>
                            Cancel
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
}