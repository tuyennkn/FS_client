'use client';

import React from 'react';
import { OrderHistory } from '../../../components/OrderHistory';

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <OrderHistory />
    </div>
  );
}