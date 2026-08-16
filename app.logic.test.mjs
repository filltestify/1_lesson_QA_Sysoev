import assert from 'node:assert/strict';
import { calcCartTotal, validateOrderForm, buildOrder, generateDeliverySlots } from './logic.js';

// calcCartTotal
assert.strictEqual(calcCartTotal([]), 0);
assert.strictEqual(
  calcCartTotal([
    { id: 'a', name: 'A', price: 100, qty: 2 },
    { id: 'b', name: 'B', price: 50, qty: 1 },
  ]),
  250
);

// validateOrderForm
assert.deepStrictEqual(validateOrderForm({ name: '', address: '', phone: '' }), {
  valid: false,
  errors: {
    name: 'Введите имя',
    address: 'Введите адрес доставки',
    phone: 'Введите корректный телефон',
  },
});
assert.deepStrictEqual(
  validateOrderForm({ name: 'Иван', address: 'ул. Ленина, 1', phone: '+7 900 123-45-67' }),
  { valid: true, errors: {} }
);
assert.strictEqual(
  validateOrderForm({ name: 'Иван', address: 'Адрес', phone: '123' }).valid,
  false
);

// buildOrder
const order = buildOrder({
  cartItems: [{ id: 'a', name: 'A', price: 100, qty: 2 }],
  name: 'Иван',
  address: 'ул. Ленина, 1',
  phone: '+79001234567',
  payment: 'cash',
  deliveryTime: 'asap',
  id: 'order-1',
  timestamp: 1000,
});
assert.deepStrictEqual(order, {
  id: 'order-1',
  items: [{ name: 'A', price: 100, qty: 2 }],
  total: 200,
  name: 'Иван',
  address: 'ул. Ленина, 1',
  phone: '+79001234567',
  payment: 'cash',
  deliveryTime: 'asap',
  timestamp: 1000,
});

// generateDeliverySlots
assert.deepStrictEqual(
  generateDeliverySlots(new Date(2026, 7, 16, 18, 5), 3),
  ['18:30–19:00', '19:00–19:30', '19:30–20:00']
);
assert.deepStrictEqual(
  generateDeliverySlots(new Date(2026, 7, 16, 18, 30), 2),
  ['18:30–19:00', '19:00–19:30']
);

console.log('OK: all logic checks passed');
