import { calcCartTotal, validateOrderForm, buildOrder, generateDeliverySlots } from './logic.js';

const MENU = [
  { id: 'soup-borsch', category: 'Супы', name: 'Борщ', price: 320 },
  { id: 'soup-mushroom', category: 'Супы', name: 'Грибной суп', price: 280 },
  { id: 'soup-tomyum', category: 'Супы', name: 'Том-ям', price: 390 },
  { id: 'pizza-margherita', category: 'Пицца', name: 'Маргарита', price: 450 },
  { id: 'pizza-pepperoni', category: 'Пицца', name: 'Пепперони', price: 520 },
  { id: 'pizza-four-cheese', category: 'Пицца', name: 'Четыре сыра', price: 540 },
  { id: 'drink-cola', category: 'Напитки', name: 'Кола 0.5л', price: 120 },
  { id: 'drink-water', category: 'Напитки', name: 'Вода 0.5л', price: 80 },
  { id: 'drink-lemonade', category: 'Напитки', name: 'Домашний лимонад', price: 150 },
];

let cart = [];

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((el) => {
    el.hidden = el.id !== `screen-${name}`;
  });
}

function renderMenu() {
  const container = document.getElementById('menu-list');
  const categories = [...new Set(MENU.map((item) => item.category))];
  container.innerHTML = categories
    .map((category) => {
      const items = MENU.filter((item) => item.category === category);
      const itemsHtml = items
        .map(
          (item) => `
        <li class="menu-item" data-id="${item.id}">
          <span class="menu-item__name">${item.name}</span>
          <span class="menu-item__price">${item.price} ₽</span>
          <button type="button" class="menu-item__add" data-id="${item.id}">В корзину</button>
        </li>`
        )
        .join('');
      return `<section class="menu-category"><h2>${category}</h2><ul>${itemsHtml}</ul></section>`;
    })
    .join('');
}

function addToCart(itemId) {
  const menuItem = MENU.find((item) => item.id === itemId);
  const existing = cart.find((item) => item.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: menuItem.id, name: menuItem.name, price: menuItem.price, qty: 1 });
  }
  renderCart();
}

function changeQty(itemId, delta) {
  const item = cart.find((i) => i.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(itemId);
    return;
  }
  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  renderCart();
}

function renderCart() {
  const list = document.getElementById('cart-items');
  list.innerHTML = cart
    .map(
      (item) => `
    <li class="cart-item" data-id="${item.id}">
      <span class="cart-item__name">${item.name}</span>
      <div class="cart-item__qty">
        <button type="button" class="qty-minus" data-id="${item.id}">−</button>
        <span>${item.qty}</span>
        <button type="button" class="qty-plus" data-id="${item.id}">+</button>
      </div>
      <span class="cart-item__price">${item.price * item.qty} ₽</span>
      <button type="button" class="cart-item__remove" data-id="${item.id}">✕</button>
    </li>`
    )
    .join('');

  const total = calcCartTotal(cart);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').textContent = String(count);
  document.getElementById('cart-total').textContent = String(total);
  document.getElementById('cart-panel-total').textContent = String(total);
  document.getElementById('checkout-total').textContent = String(total);
  document.getElementById('cart-checkout-btn').disabled = cart.length === 0;
}

function populateDeliverySlots() {
  const select = document.getElementById('field-delivery-time');
  const slots = generateDeliverySlots(new Date());
  const options = ['<option value="asap">Как можно скорее</option>']
    .concat(slots.map((slot) => `<option value="${slot}">${slot}</option>`))
    .join('');
  select.innerHTML = options;
}

function renderCheckoutScreen() {
  populateDeliverySlots();
  document.getElementById('checkout-total').textContent = String(calcCartTotal(cart));
}

function saveOrder(order) {
  const orders = loadOrders();
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));
}

function loadOrders() {
  const raw = localStorage.getItem('orders');
  return raw ? JSON.parse(raw) : [];
}

function orderItemsHtml(items) {
  return items.map((item) => `<li>${item.name} × ${item.qty} — ${item.price * item.qty} ₽</li>`).join('');
}

function renderConfirmation(order) {
  const itemsHtml = orderItemsHtml(order.items);
  const deliveryLabel = order.deliveryTime === 'asap' ? 'Как можно скорее' : order.deliveryTime;
  const paymentLabel = order.payment === 'cash' ? 'Наличными курьеру' : 'Картой курьеру';
  const commentHtml = order.comment ? `<p>Комментарий: ${order.comment}</p>` : '';
  document.getElementById('confirmation-details').innerHTML = `
    <div class="stamp">Заказ принят</div>
    <p>Номер заказа: ${order.id}</p>
    <ul class="order-items">${itemsHtml}</ul>
    <p>Итого: ${order.total} ₽</p>
    <p>Доставка: ${deliveryLabel}, оплата: ${paymentLabel}</p>
    <p>${order.name}, ${order.address}, ${order.phone}</p>
    ${commentHtml}
  `;
}

function renderHistory() {
  const orders = loadOrders();
  const container = document.getElementById('history-list');
  if (orders.length === 0) {
    container.innerHTML = '<p>Заказов пока нет.</p>';
    return;
  }
  container.innerHTML = orders
    .slice()
    .reverse()
    .map((order) => {
      const itemsHtml = orderItemsHtml(order.items);
      const date = new Date(order.timestamp).toLocaleString('ru-RU');
      return `
        <article class="history-order">
          <h3>Заказ ${order.id} — ${date}</h3>
          <ul class="order-items">${itemsHtml}</ul>
          <p>Итого: ${order.total} ₽</p>
        </article>`;
    })
    .join('');
}

function handleCheckoutSubmit(event) {
  event.preventDefault();
  if (cart.length === 0) {
    showScreen('menu');
    return;
  }
  const formData = {
    name: document.getElementById('field-name').value,
    address: document.getElementById('field-address').value,
    phone: document.getElementById('field-phone').value,
  };
  const { valid, errors } = validateOrderForm(formData);
  document.getElementById('error-name').textContent = errors.name || '';
  document.getElementById('error-address').textContent = errors.address || '';
  document.getElementById('error-phone').textContent = errors.phone || '';
  if (!valid) return;

  const payment = document.querySelector('input[name="payment"]:checked').value;
  const deliveryTime = document.getElementById('field-delivery-time').value;
  const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const order = buildOrder({
    cartItems: cart,
    name: formData.name,
    address: formData.address,
    phone: formData.phone,
    payment,
    deliveryTime,
    id,
    timestamp: Date.now(),
  });

  const comment = document.getElementById('field-comment').value.trim();
  if (comment) {
    order.comment = comment;
  }

  saveOrder(order);
  cart = [];
  renderCart();
  renderConfirmation(order);
  showScreen('confirmation');
}

function init() {
  renderMenu();
  showScreen('menu');

  document.getElementById('nav-menu').addEventListener('click', () => showScreen('menu'));
  document.getElementById('nav-history').addEventListener('click', () => {
    renderHistory();
    showScreen('history');
  });

  document.getElementById('menu-list').addEventListener('click', (event) => {
    const btn = event.target.closest('.menu-item__add');
    if (btn) addToCart(btn.dataset.id);
  });

  document.getElementById('cart-items').addEventListener('click', (event) => {
    const id = event.target.dataset.id;
    if (!id) return;
    if (event.target.classList.contains('qty-plus')) changeQty(id, 1);
    if (event.target.classList.contains('qty-minus')) changeQty(id, -1);
    if (event.target.classList.contains('cart-item__remove')) removeFromCart(id);
  });

  document.getElementById('cart-toggle').addEventListener('click', () => {
    document.getElementById('cart-panel').hidden = false;
  });
  document.getElementById('cart-close-btn').addEventListener('click', () => {
    document.getElementById('cart-panel').hidden = true;
  });
  document.getElementById('cart-checkout-btn').addEventListener('click', () => {
    document.getElementById('cart-panel').hidden = true;
    renderCheckoutScreen();
    showScreen('checkout');
  });

  document.getElementById('checkout-form').addEventListener('submit', handleCheckoutSubmit);
  document.getElementById('checkout-back-btn').addEventListener('click', () => showScreen('menu'));
  document.getElementById('confirmation-menu-btn').addEventListener('click', () => showScreen('menu'));
}

document.addEventListener('DOMContentLoaded', init);
