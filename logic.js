export function calcCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
}

export function validateOrderForm({ name, address, phone }) {
  const errors = {};
  if (!name || !name.trim()) {
    errors.name = 'Введите имя';
  }
  if (!address || !address.trim()) {
    errors.address = 'Введите адрес доставки';
  }
  const digitCount = (phone || '').replace(/\D/g, '').length;
  if (digitCount < 5) {
    errors.phone = 'Введите корректный телефон';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function buildOrder({ cartItems, name, address, phone, payment, deliveryTime, id, timestamp }) {
  return {
    id,
    items: cartItems.map((item) => ({ name: item.name, price: item.price, qty: item.qty })),
    total: calcCartTotal(cartItems),
    name,
    address,
    phone,
    payment,
    deliveryTime,
    timestamp,
  };
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function generateDeliverySlots(now, count = 6) {
  const start = new Date(now);
  start.setSeconds(0, 0);
  const minutes = start.getMinutes();
  const remainder = minutes % 30;
  if (remainder !== 0 || now.getSeconds() > 0) {
    start.setMinutes(minutes - remainder + 30);
  }
  const slots = [];
  for (let i = 0; i < count; i++) {
    const slotStart = new Date(start.getTime() + i * 30 * 60000);
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);
    slots.push(`${formatTime(slotStart)}–${formatTime(slotEnd)}`);
  }
  return slots;
}
