import { Col, Container, Row } from 'react-bootstrap';
import ShoppingListView from './ShoppingListView';
import '../../styles/buttons.css';

function ShoppingListClient({ initialShoppingLists }: { initialShoppingLists: any[]; }) {
  return (
    <main>
      <Container id="view-shopping-list" className="py-3">
        <Row className="mb-3">
          <Col>
          </Col>
          <Col sm="auto" className="d-flex justify-content-between align-items-center">
            <h1>Your Shopping Lists</h1>
          </Col>
          <Col sm>
          </Col>
        </Row>
        <Row>
          <Col>
            <ShoppingListView initialShoppingLists={initialShoppingLists} />
          </Col>
        </Row>
      </Container>

    </main>
  );
}

export default ShoppingListClient;
