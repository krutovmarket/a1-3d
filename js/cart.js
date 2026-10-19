const WORKER_URL = 'https://functions.yandexcloud.net/d4eufvmbprafagia9tj2';
let cartIds = JSON.parse(localStorage.getItem('a1_cart')) || [];
let allProducts = [];
let cartProducts = [];

// Загружаем базу товаров
fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderCart();
  });

function renderCart() {
  const container = document.getElementById('cart-items');
  const form = document.getElementById('order-form');
  
  if (cartIds.length === 0) {
    container.innerHTML = '<p>Ваша корзина пуста. <a href="catalog.html" style="color: var(--accent);">Перейти в каталог</a></p>';
    form.style.display = 'none';
    return;
  }

  cartProducts = allProducts.filter(p => cartIds.includes(p.id));
  container.innerHTML = '';

  cartProducts.forEach(product => {
    const item = document.createElement('div');
    item.style = "display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid var(--border);";
    item.innerHTML = `
      <div>
        <strong>${product.title}</strong><br>
        <span style="color: var(--text-muted); font-size: 14px;">${product.price}</span>
      </div>
      <button class="btn btn-outline remove-item" data-id="${product.id}" style="padding: 5px 10px; font-size: 12px;">Удалить</button>
    `;
    container.appendChild(item);
  });

  form.style.display = 'block';

  // Кнопки удаления
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      cartIds = cartIds.filter(cartId => cartId !== id);
      localStorage.setItem('a1_cart', JSON.stringify(cartIds));
      renderCart();
    });
  });
}

// Отправка заказа в Cloudflare Worker -> ВК
document.getElementById('submit-order').addEventListener('click', async () => {
  const name = document.getElementById('client-name').value.trim();
  const phone = document.getElementById('client-phone').value.trim();
  const statusMsg = document.getElementById('status-msg');

  if (!name || !phone) {
    statusMsg.textContent = 'Пожалуйста, заполните имя и контакты.';
    return;
  }

  const btn = document.getElementById('submit-order');
  btn.textContent = 'Отправка...';
  btn.disabled = true;

  // Формируем текст заказа
  let message = `🛒 НОВЫЙ ЗАКАЗ С САЙТА\n\n`;
  message += `👤 Клиент: ${name}\n`;
  message += `📞 Контакты: ${phone}\n\n`;
  message += `📦 Товары:\n`;
  cartProducts.forEach((p, index) => {
    message += `${index + 1}. ${p.title} (${p.price})\n`;
  });

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });

    if (response.ok) {
      statusMsg.style.color = 'green';
      statusMsg.textContent = 'Заказ успешно отправлен! Я свяжусь с вами.';
      localStorage.removeItem('a1_cart'); // Очищаем корзину
      setTimeout(() => { window.location.href = 'index.html'; }, 3000);
    } else {
      throw new Error('Ошибка сервера');
    }
  } catch (error) {
    statusMsg.style.color = 'red';
    statusMsg.textContent = 'Ошибка при отправке. Напишите мне напрямую в ВК.';
    btn.textContent = 'Отправить заказ';
    btn.disabled = false;
  }
});
