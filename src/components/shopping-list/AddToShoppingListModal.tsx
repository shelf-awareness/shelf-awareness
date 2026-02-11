'use client';

import { Button, Col, Form, Modal, Row, InputGroup, Offcanvas } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AddShoppingListItemSchema } from '@/lib/validationSchemas';
import { addShoppingListItem } from '@/lib/dbActions';

import { ShoppingListWithProtein } from '../../types/shoppingList';

// ------- types -------
// type SL = { id: number; name: string };
type SL = Pick<ShoppingListWithProtein, 'id' | 'name'>;

type AddItemValues = {
  name: string;
  quantity: number;
  shoppingListId: number;
  price?: number;
  unit?: string;
  proteinGrams?: number;
};

interface Props {
  show: boolean;
  onHide: () => void;
  shoppingLists: SL[];
  sidePanel: boolean;
  prefillName: string;
}

const AddToShoppingListModal = ({
  show,
  onHide,
  shoppingLists,
  sidePanel = false,
  prefillName,
}: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const owner = session?.user?.email;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddItemValues>({
    resolver: yupResolver(AddShoppingListItemSchema),
    defaultValues: {
      name: prefillName,
      quantity: 0,
      unit: '',
      price: 0,
      proteinGrams: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
    },
  });

  useEffect(() => {
    if (!show) reset({ name: prefillName, proteinGrams:0 });
  }, [show, reset, prefillName]);

  const handleClose = () => {
    reset({ name: prefillName, proteinGrams:0 });
    onHide();
  };

  const onSubmit = async (data: AddItemValues) => {
    if (!owner) {
      swal('Error', 'You must be signed in to add to your shopping list.', 'error');
      return;
    }

    try {
      const price = typeof data.price === 'number'
        ? data.price
        : parseFloat(data.price || '0');

      const proteinGrams = typeof data.proteinGrams === 'number'
        ? data.proteinGrams
        : parseFloat(data.proteinGrams || '0');

      await addShoppingListItem({
        name: data.name.trim(),
        quantity: Number(data.quantity),
        unit: data.unit || '',
        price,
        proteinGrams,
        shoppingListId: Number(data.shoppingListId),
      });

      swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Something went wrong', 'error');
    }
  };

  const formContent = (
    <Form className="mobile-section" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Row className="mb-3 mobile-grid">
        <Col xs={12} sm={6}>
          <Form.Group>
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Bananas"
              {...register('name')}
              className={`${errors.name ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={6} sm={3}>
          <Form.Group>
            <Form.Label>Qty</Form.Label>
            <Form.Control
              type="number"
              min={1}
              {...register('quantity')}
              className={`${errors.quantity ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.quantity?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={6} sm={3}>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Control type="text" {...register('unit')} />
          </Form.Group>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col xs={12} sm={5}>
          <Form.Group>
            <Form.Label>Price (optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                {...register('price', { valueAsNumber: true })}
                className={`${errors.price ? 'is-invalid' : ''}`}
              />
            </InputGroup>
            <div className="invalid-feedback">{errors.price?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={12} sm={4}>
          <Form.Group>
            <Form.Label>Protein (g)</Form.Label>
            <Form.Control
              type="number"
              step="0.1"
              min="0"
              placeholder="0"
              {...register('proteinGrams', { valueAsNumber: true })}
              className={`${errors.proteinGrams ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.proteinGrams?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={12} sm={7}>
          <Form.Group>
            <Form.Label>List</Form.Label>
            <Form.Select
              {...register('shoppingListId', { valueAsNumber: true })}
              defaultValue={shoppingLists[0]?.id ?? ''}
            >
              <option value="">Choose a list…</option>
              {shoppingLists.map((sl) => (
                <option key={sl.id} value={sl.id}>
                  {sl.name}
                </option>
              ))}
            </Form.Select>
            <div className="invalid-feedback">{errors.shoppingListId?.message}</div>
          </Form.Group>
        </Col>
      </Row>

      <Row className="pt-3 mobile-grid">
        <Col>
          <Button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Submit'}
          </Button>
        </Col>
        <Col>
          <Button
            type="button"
            onClick={() => reset({ name: prefillName, proteinGrams:0 })}
            variant="warning"
            className="btn-reset mobile-card"
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );

  return !sidePanel ? (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Shopping List Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>{formContent}</Modal.Body>
    </Modal>
  ) : (
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Shopping List Item</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>{formContent}</Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddToShoppingListModal;
