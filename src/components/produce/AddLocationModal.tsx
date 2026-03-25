'use client';

import { useEffect } from 'react';
import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { AddLocationSchema } from '@/lib/validationSchemas';
import { addLocation } from '@/lib/dbActions';
import '../../styles/buttons.css';

type LocationValues = {
  name: string;
  owner: string;
  address: string;
};

interface AddLocationModalProps {
  show: boolean;
  onHide: () => void;
  owner: string;
}

export default function AddLocationModal({ show, onHide, owner }: AddLocationModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LocationValues>({
    resolver: yupResolver(AddLocationSchema) as unknown as Resolver<LocationValues>,
    defaultValues: { name: '', owner, address: '' },
  });

  useEffect(() => {
    if (show) reset({ name: '', owner, address: '' });
  }, [show, owner, reset]);

  const handleClose = () => {
    reset();
    onHide();
  };

  const onSubmit: SubmitHandler<LocationValues> = async (data) => {
    try {
      await addLocation(data);
      await swal('Success', 'Location added successfully!', 'success', { timer: 1800 });
      handleClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      await swal('Error', 'Failed to add location.', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add New Location</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="mb-1 required-field">Location Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., House, Apartment, Office"
                  isInvalid={!!errors.name}
                  {...register('name')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message as string}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="mb-1">Address</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., 123 Main St, Honolulu, HI 96813"
                  isInvalid={!!errors.address}
                  {...register('address')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address?.message as string}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  Used to pin this location on the map.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <input type="hidden" {...register('owner')} value={owner} />

          <Row className="d-flex justify-content-between mt-4">
            <Col xs={6}>
              <Button type="submit" className="btn-submit">Add</Button>
            </Col>
            <Col xs={6}>
              <Button type="button" variant="warning" onClick={() => reset()} className="btn-reset">
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
  );
}