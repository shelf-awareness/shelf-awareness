'use client'; 

import { Card, ListGroup, Button, Badge, Form } from 'react-bootstrap';
import { useState } from 'react';
import { Trash } from 'react-bootstrap-icons';
import { FaPencilAlt, FaCheck, FaTimes } from 'react-icons/fa';
import ViewShoppingListModal from './ViewShoppingListModal';
import DeleteShoppingListModal from './DeleteShoppingListModal';

import { ShoppingListWithProtein } from '../../types/shoppingList';

// type ShoppingListCardProps = {
//   shoppingList: any;
// };

type ShoppingListCardProps = {
  shoppingList: ShoppingListWithProtein;
};


const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function ShoppingListCard({ shoppingList }: ShoppingListCardProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(shoppingList.name);
  const [tempName, setTempName] = useState(shoppingList.name);

  const handleCancel = () => {
    setTempName(name);
    setEditing(false);
  };

  const handleSave = async () => {
    if (!tempName.trim()) return;

    await fetch(`/api/shopping-list/${shoppingList.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tempName }),
    });

    setName(tempName);
    setEditing(false);
  };

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const totalItems = shoppingList.items?.length || 0;

  const totalCost = shoppingList.items?.reduce((sum: number, item: any) => {
    const price = item.price ? parseFloat(item.price.toString()) : 0;
    return sum + price * item.quantity;
  }, 0) || 0;

  return (
    // TODO: Refine the resizing logic of the cards and reduce whitespace for mobile viewports
    <Card className="h-100 mb-3 image-shadow">
      <Card.Header
        className="d-flex align-items-center"
        style={{ height: '48px', paddingTop: '0px', paddingBottom: '0px' }}
      >
        <Card.Title
          className="d-flex align-items-center"
          style={{ margin: 0, gap: '6px' }}
        >
          {!editing ? (
            <>
              <span>{name}</span>
              <FaPencilAlt
                style={{
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  position: 'relative',
                  top: '-1px',
                }}
                onClick={() => setEditing(true)}
              />
            </>
          ) : (
            <div className="d-flex align-items-center" style={{ gap: '6px' }}>
              <Form.Control
                size="sm"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                style={{ height: '28px', padding: '2px 6px' }}
                autoFocus
              />
              <FaCheck
                style={{
                  cursor: 'pointer',
                  color: 'green',
                  position: 'relative',
                  top: '-1px',
                }}
                onClick={handleSave}
              />
              <FaTimes
                style={{
                  cursor: 'pointer',
                  color: 'red',
                  position: 'relative',
                  top: '-1px',
                }}
                onClick={handleCancel}
              />
            </div>
          )}
        </Card.Title>
      </Card.Header>

      <Card.Body className="bg-light">
        <ListGroup variant="flush">
          <ListGroup.Item className="bg-light">
            <strong>Date Created:</strong>
            {' '}
            {formatDate(shoppingList.createdAt)}
          </ListGroup.Item>
          <ListGroup.Item className="bg-light">
            <strong>Total Items:</strong>
            {' '}
            <Badge bg="primary">{totalItems}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="bg-light">
            <strong>Estimated Cost:</strong>
            {' '}
            $
            {totalCost.toFixed(2)}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Total Protein:</strong>{' '}
            {shoppingList.totalProtein.toFixed(1)} g
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>

      <Card.Footer className="d-flex flex-sm-row gap-2 mobile-actions">
        <Button className="editbutton w-100 w-sm-auto mobile-view-btn mobile-view"
          onClick={() => setShowViewModal(true)}>
          View
        </Button>

        <Button
          variant="danger"
          className="d-flex align-items-center justify-content-center mobile-trash"
          onClick={() => setShowDeleteModal(true)}
          style={{ width: '44px', height: '44px', padding: 0 }}
        >
          <Trash color="white" size={18} />
        </Button>
      </Card.Footer>

      <ViewShoppingListModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        shoppingList={shoppingList}
      />

      <DeleteShoppingListModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        shoppingList={shoppingList}
      />
    </Card>
  );
}
