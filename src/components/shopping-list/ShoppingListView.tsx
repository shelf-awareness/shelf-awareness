'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { getBudgetByUserId } from '@/lib/dbActions';
import AddShoppingList from './AddShoppingList';
import ShoppingListCard from './ShoppingListCard';
import AddToShoppingListModal from './AddToShoppingListModal';
import RecommendedWidget from './RecommendedWidget';
import UpdateBudget from './UpdateBudget';
import RecipesModal from '../recipes/RecipesModal';

import { ShoppingListWithProtein } from '../../types/shoppingList';

// type ShoppingListViewProps = {
//   initialShoppingLists: any[];
// };

type ShoppingListViewProps = {
  initialShoppingLists: ShoppingListWithProtein[];
};


export default function ShoppingListView({ initialShoppingLists }: ShoppingListViewProps) {
  const { data: session } = useSession();
  const [shoppingLists, setShoppingLists] = useState<ShoppingListWithProtein[]>(initialShoppingLists);
  const [searchTerm, setSearchTerm] = useState('');
  const [show, setShow] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);
  const [showUpdateBudget, setShowUpdateBudget] = useState(false);
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const [budget, setBudget] = useState<string>('$0.00');
  const [loadingBudget, setLoadingBudget] = useState(true);

  useEffect(() => {
    const fetchBudget = async () => {
      if (!session?.user?.id) {
        setLoadingBudget(false);
        return;
      }

      try {
        const budgetStr = await getBudgetByUserId(Number(session.user.id));
        const budgetAmount = parseFloat(budgetStr || '0');
        setBudget(`$${budgetAmount.toFixed(2)}`);
      } catch (error) {
        console.error('Error fetching budget:', error);
      } finally {
        setLoadingBudget(false);
      }
    };

    fetchBudget();
  }, [session?.user?.id]);

  const refetchBudget = async () => {
  if (!session?.user?.id) return;
  try {
    const budgetStr = await getBudgetByUserId(Number(session.user.id));
    const budgetAmount = parseFloat(budgetStr || '0');
    setBudget(`$${budgetAmount.toFixed(2)}`);
  } catch (error) {
    console.error('Error refetching budget:', error);
  }
};


  const handleListCreated = useCallback((newList: ShoppingListWithProtein) => {
    setShoppingLists((prev) => [newList, ...prev]);
  }, []);

  const searchLower = searchTerm.toLowerCase();
  const filteredLists = shoppingLists.filter((list) => list.name.toLowerCase().includes(searchLower));

  return (
    <>
      {/* Search + Buttons Row */}
      <Row
        className="mb-4 d-flex justify-content-center align-items-center text-center"
        style={{ minHeight: '50px' }}
      >
        <Col xs={12} md={6} lg={4} className="mb-2">
          <Form.Control
            type="text"
            placeholder="Search shopping lists..."
            className="mobile-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>

        <Col xs="auto" className="mb-2">
          <Button
            onClick={() => setShow(true)}
            style={{
              backgroundColor: 'var(--fern-green)',
              height: '34px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-submit"
          >
            + Add Item to List
          </Button>
          <AddToShoppingListModal
            show={show}
            onHide={() => setShow(false)}
            shoppingLists={shoppingLists}
            sidePanel={false}
            prefillName=""
          />
        </Col>

        <Col xs="auto" className="mb-2">
          <Button
            onClick={() => setShowCreateList(true)}
            style={{
              backgroundColor: 'var(--fern-green)',
              height: '34px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-submit"
          >
            + New List
          </Button>

          <AddShoppingList
            show={showCreateList}
            onHide={() => setShowCreateList(false)}
            owner={session?.user?.email ?? ''}
          />
        </Col>

        {/* FUTURE FEATURE: SET BUDGET */}
        <Col xs="auto" className="mb-2">
          <Button
            onClick={() => setShowUpdateBudget(true)}
            style={{
              backgroundColor: 'var(--fern-green)',
              height: '34px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-submit"
          >
            + Set Budget
          </Button>

          <UpdateBudget
            show={showUpdateBudget}
            onHide={() => setShowUpdateBudget(false)}
            userID={Number(session?.user?.id ?? 0)}
            onBudgetUpdated={refetchBudget} 
          />
        </Col>

        <Col xs="auto" className="mb-2">
          <Button
            onClick={() => setShowRecipesModal(true)}
            style={{
              backgroundColor: 'var(--fern-green)',
              height: '34px',
              padding: '4px 12px',
              display: 'flex',
              alignItems: 'center',
            }}
            className="btn-submit"
          >
            + Create From Recipe
          </Button>
        </Col>

        <RecipesModal
          show={showRecipesModal}
          onHide={() => setShowRecipesModal(false)}
          onListCreated={handleListCreated}
        />

        <Col xs="auto" className="mb-2">
          <div
            style={{
              backgroundColor: 'var(--fern-green)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              minWidth: '120px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Budget</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {loadingBudget ? 'Loading...' : budget}
            </div>
          </div>
        </Col>
      </Row>

      {/* MAIN LAYOUT: Lists left, Recommended right */}
      <Row className="d-flex flex-column flex-md-row">
        {/* LEFT SIDE — Shopping Lists */}
        <Col xs={12} md={8}>
          {filteredLists.length === 0 ? (
            <Row>
              <Col className="text-center">
                <p className="text-muted">No shopping lists found. Create one to get started!</p>
              </Col>
            </Row>
          ) : (
            <Row>
              {filteredLists.map((list) => (
                <Col key={list.id} md={6} className="mb-4">
                  <ShoppingListCard shoppingList={list} />
                </Col>
              ))}
            </Row>
          )}
        </Col>

        {/* RIGHT SIDE — Recommended Items */}
        <Col xs={12} md={4} className="mt-4 mt-md-0">
          {session?.user?.email && (
          <RecommendedWidget
            owner={session?.user?.email ?? ''}
            shoppingLists={shoppingLists}
          />
          )}
        </Col>
      </Row>
    </>
  );
}
