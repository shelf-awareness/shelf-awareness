/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */

'use client';

import { useState, useEffect } from 'react';
import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { BagCheckFill } from 'react-bootstrap-icons';
import AddToShoppingListModal from './AddToShoppingListModal';
import EditShoppingListItemModal from './EditShoppingListItemModal';
import { FaPencilAlt, FaTrash } from 'react-icons/fa';
import { ShoppingListWithProtein } from '../../types/shoppingList';
import { useSession } from 'next-auth/react';

// interface ShoppingListItem {
//   id: number;
//   name: string;
//   quantity: number;
//   unit?: string | null;
//   price?: number | null;
//   restockTrigger?: string | null;
//   customThreshold?: number | null;
// }

// interface ShoppingList {
//   id: number;
//   name: string;
//   items?: ShoppingListItem[];
// }

// interface ViewShoppingListModalProps {
//   show: boolean;
//   onHide: () => void;
//   shoppingList?: ShoppingList; // optional for safety
// }

interface ViewShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList?: ShoppingListWithProtein; // optional for safety
}

const ViewShoppingListModal = ({ show, onHide, shoppingList }: ViewShoppingListModalProps) => {
  // const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [items, setItems] = useState<ShoppingListWithProtein['items']>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  // const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);
  const [editingItem, setEditingItem] = useState<ShoppingListWithProtein['items'][number] | null>(null);
  const { data: session } = useSession();
  // locations
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  // storages
  const [storages, setStorages] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState('');

  // Update items when the shopping list changes
  useEffect(() => {
    if (!shoppingList) return;

    setItems(shoppingList.items ?? []);

    const saved = localStorage.getItem(`checkboxes-${shoppingList.id}`);
    setCheckedState(saved ? JSON.parse(saved) : {});
  }, [shoppingList]);

  const handleRestockChange = async (itemId: number, restockTrigger: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, restockTrigger } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restockTrigger }),
    });
  };

  const handleThresholdChange = async (itemId: number, customThreshold: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, customThreshold } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customThreshold }),
    });
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      setDeletingItemId(itemId);
      await fetch(`/api/shopping-list-item/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingItemId(null);
    }
  };

  const toggleCheckbox = (itemId: number) => {
    setCheckedState(prev => {
      const updated = { ...prev, [itemId]: !prev[itemId] };

      if (shoppingList) {
        localStorage.setItem(`checkboxes-${shoppingList.id}`, JSON.stringify(updated));
      }

      return updated;
    });
  };

  const handleSelectAll = () => {
    const allChecked = items.every((item) => checkedState[item.id]);
    const updated: Record<number, boolean> = {};
    items.forEach((item) => {
      updated[item.id] = !allChecked;
    });
    setCheckedState(updated);
    if (shoppingList) {
      localStorage.setItem(`checkboxes-${shoppingList.id}`, JSON.stringify(updated));
    }
  };

  const handleMoveToPantryClick = async () => {
    if (!shoppingList) return;
    const email = session?.user?.email;
    if (!email) return;

    const res = await fetch(`/api/locations?owner=${email}`);
    const data = await res.json();
    setLocations(data);

    const firstLocation = data[0] ?? 'Default Pantry';
    setSelectedLocation(firstLocation);

    // fetch storages for first location
    // eslint-disable-next-line max-len
    const storageRes = await fetch(`/api/storage?location=${encodeURIComponent(firstLocation)}&owner=${encodeURIComponent(email)}`);
    const storageData = await storageRes.json();
    setStorages(storageData);
    setSelectedStorage(storageData[0] ?? 'Default Shelf');

    setShowLocationModal(true);
  };

  const handleMoveToPantryConfirm = async () => {
    const checkedIds = items
      .filter((item) => checkedState[item.id])
      .map((item) => item.id);

    for (const id of checkedIds) {
      await fetch(`/api/shopping-list-item/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: selectedLocation,
          storageName: selectedStorage,
        }),
      });
    }

    setItems((prev) => prev.filter((item) => !checkedState[item.id]));
    setCheckedState({});
    setShowLocationModal(false);
    if (shoppingList) {
      localStorage.removeItem(`checkboxes-${shoppingList.id}`);
    }
  };

  const handleLocationChange = async (locationName: string) => {
    setSelectedLocation(locationName);
    setSelectedStorage('');

    const email = session?.user?.email;
    if (!email || !locationName) return;

    // eslint-disable-next-line max-len
    const res = await fetch(`/api/storage?location=${encodeURIComponent(locationName)}&owner=${encodeURIComponent(email)}`);
    const data = await res.json();
    setStorages(data);
    setSelectedStorage(data[0] ?? 'Default Shelf');
  };

  if (!shoppingList) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg" fullscreen="sm-down">
        <Modal.Header className="justify-content-center">
          <Modal.Title>{shoppingList?.name ?? 'Shopping List'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {items.length > 0 ? (
            <Row>
              <Col>
                <Table striped bordered hover size="sm" responsive >
                  <thead>
                    <tr>
                      <th className="text-center">
                        <input
                          type="checkbox"
                          checked={items.length > 0 && items.every((item) => checkedState[item.id])}
                          onChange={handleSelectAll}
                          aria-label="Select all items"
                        />
                      </th>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Protein</th>
                      <th>Restock When</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="text-center">
                          <input
                            type="checkbox"
                            checked={!!checkedState[item.id]}
                            onChange={() => toggleCheckbox(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                        </td>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit || '-'}</td>
                        <td>{item.price ? `$${Number(item.price).toFixed(2)}` : 'N/A'}</td>
                        <td>{item.proteinGrams ? `${Number(item.proteinGrams).toFixed(1)}g` : 'N/A'}</td>
                        <td>
                          <select
                            value={item.restockTrigger || 'empty'}
                            onChange={(e) => handleRestockChange(item.id, e.target.value)}
                            className="form-select form-select-sm"
                          >
                            <option value="empty">When empty</option>
                            <option value="half">When half gone</option>
                          </select>

                          )
                        </td>
                        <td className="d-flex gap-3 justify-content-center align-items-center">
                          <FaPencilAlt
                            style={{ cursor: 'pointer' }}
                            onClick={() => setEditingItem(item)}
                          />

                          <FaTrash
                            style={{ cursor: 'pointer', color: 'red' }}
                            onClick={() => handleDeleteItem(item.id)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          ) : (
            <Row>
              <Col className="text-center">
                <p className="text-muted mb-0">No items in this shopping list.</p>
              </Col>
            </Row>
          )}
          <Row className="pt-4"> 
            <Col className="text-center">
              <Button
                variant="success"
                className="btn-submit"
                disabled={Object.values(checkedState).every(v => !v)}
                onClick={handleMoveToPantryClick}
              >
                ✓ Move Checked to Pantry
              </Button>
            </Col>
          </Row>
          <Row className="pt-4">
            <Col className="text-center">
              <Button
                variant="success"
                style={{ backgroundColor: 'var(--fern-green)' }}
                className="btn-submit"
                onClick={() => {
                  onHide();
                  setShowAddModal(true);
                }}
              >
                + Add Item
              </Button>
            </Col>
            <Col className="text-center">
              <Button onClick={onHide} variant="secondary" className="btn-submit">
                Close
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      <AddToShoppingListModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shoppingLists={[shoppingList]}
        sidePanel={false}
        prefillName=""
      />
      {editingItem && (
      <EditShoppingListItemModal
        show={!!editingItem}
        onHide={() => setEditingItem(null)}
        item={{
          ...editingItem,
          price: editingItem.price ? Number(editingItem.price.toString()) : null,
        }}
      />
      )}
      <Modal show={showLocationModal} onHide={() => setShowLocationModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Choose Pantry Location</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Location:</Form.Label>
            <Form.Select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Shelf:</Form.Label>
            <Form.Select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
            >
              {storages.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              {storages.length === 0 && (
                <option value="Default Shelf">Default Shelf</option>
              )}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLocationModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleMoveToPantryConfirm}
            disabled={!selectedLocation}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// ViewShoppingListModal.defaultProps = {
//   shoppingList: {
//     id: 0,
//     name: '',
//     items: [],
//   },
// };

export default ViewShoppingListModal;
