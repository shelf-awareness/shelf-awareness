'use client';

import { Container, Card, Button, Stack, Badge } from 'react-bootstrap';
import { GeoAlt, Shop } from 'react-bootstrap-icons';

const MapPage: React.FC = () => {
    return (
        <Container fluid className="p-0">
            {/* Header */}
            {/* Sticky header so title stays visible when scrolling */}
            <div className="p-3 border-bottom bg-white sticky-top">
                <h5 className="mb-1 text-center">
                    Nearby Grocery Stores
                </h5>
            </div>

            {/* ================= MAP PLACEHOLDER ================= */}
            <div
                style={{
                height: '40vh',        // 40% of screen height → mobile friendly
                minHeight: '250px',    // prevents map from becoming too small
                backgroundColor: '#e9ecef', // placeholder gray
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                }}
            >
                {/* Location pin icon for visual clarity */}
                <GeoAlt size={42} className="mb-2" />

                {/* Placeholder text explaining future behavior */}
                <span className="text-muted text-center px-3">
                Google Map will appear here
                </span>
            </div>
        </Container>
    );
};

export default MapPage;