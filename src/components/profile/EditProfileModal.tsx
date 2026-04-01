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
            </Modal.Header>

            <Modal.Body>

            </Modal.Body>
        </Modal>
    );
}