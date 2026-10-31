const WORKER_URL = 'https://functions.yandexcloud.net/d4eufvmbprafagia9tj2';
let cartItems = JSON.parse(localStorage.getItem('a1_cart')) || [];
let allProducts = [];

fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderCart();
  });

function renderCart() {
  const container = document.getElementById('cart-items');
  const form = document.getElementById('order-form');
  
  if (cartItems.length === 0) {
    container.innerHTML = '<p>Ваша корзина пуста. <a href="catalog.html" style="color: var(--accent);">Перейти в каталог</a></p>';
    form.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  let totalPrice = 0;

  cartItems.forEach((item, index) => {
    const isObj = typeof item === 'object';
    const id = isObj ? item.id : item;
    const qty = isObj ? item.qty : 1;
    const config = isObj ? item.config : null;
    const customPrice = isObj ? item.customPrice : null;

    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const priceNum = parseInt(product.price.replace(/[^\d]/g, '')) || 0;
    
    let itemTotal = 0;
    let priceDisplay = "";
    
    // Если у товара есть кастомная цена (Коробка), используем её
    if (customPrice) {
      itemTotal = customPrice * qty;
      priceDisplay = `${customPrice} ₽ x ${qty} шт.`;
    } else {
      itemTotal = priceNum * qty;
      priceDisplay = `${product.price} x ${qty} шт.`;
      
      // Скидка для подиумов
      if (id === 38 && qty >= 10) {
        itemTotal = Math.round(itemTotal * 0.9);
        priceDisplay += ` <br><span style="font-size: 12px; color: #4CAF50; font-weight: bold;">✓ Скидка 10% применена</span>`;
      }
    }

    totalPrice += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.style = "display: flex; justify-content: space-between; align-items: flex-start; padding: 15px 0; border-bottom: 1px solid var(--border);";
    
    let titleHTML = `<strong>${product.title}</strong>`;
    if (config) {
      titleHTML += `<br><span style="font-size: 13px; color: var(--text-muted); word-break: break-word;">${config}</span>`;
    }

    itemDiv.innerHTML = `
      <div style="flex: 1; padding-right: 15px;">
        ${titleHTML}<br>
        <span style="color: var(--text-muted); font-size: 14px;">${priceDisplay}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: bold; white-space: nowrap;">${itemTotal} ₽</span>
        <button class="btn btn-outline remove-item" data-index="${index}" style="padding: 5px 10px; font-size: 12px; border-color: #ffcccc; color: red;">✕</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  const totalDiv = document.createElement('div');
  totalDiv.style = "text-align: right; margin-top: 20px; font-size: 20px; font-weight: bold;";
  totalDiv.innerHTML = `Итого: <span style="color: var(--accent);">${totalPrice} ₽</span>`;
  container.appendChild(totalDiv);

  form.style.display = 'block';

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'));
      cartItems.splice(idx, 1);
      localStorage.setItem('a1_cart', JSON.stringify(cartItems));
      renderCart();
    });
  });
}

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

  let message = `🛒 НОВЫЙ ЗАКАЗ С САЙТА\n\n👤 Клиент: ${name}\n📞 Контакты: ${phone}\n\n📦 Товары:\n`;
  let total = 0;

  cartItems.forEach((item, index) => {
    const isObj = typeof item === 'object';
    const id = isObj ? item.id : item;
    const qty = isObj ? item.qty : 1;
    const config = isObj ? item.config : null;
    const customPrice = isObj ? item.customPrice : null;
    const product = allProducts.find(p => p.id === id);
    
    if (product) {
       const priceNum = parseInt(product.price.replace(/[^\d]/g, '')) || 0;
       let itemTotal = 0;
       
       if (customPrice) {
         itemTotal = customPrice * qty;
       } else {
         itemTotal = priceNum * qty;
         if (id === 38 && qty >= 10) {
             itemTotal = Math.round(itemTotal * 0.9);
         }
       }
       
       total += itemTotal;
       
       message += `${index + 1}. ${product.title}\n`;
       if (config) message += `   (${config})\n`;
       message += `   ${qty} шт. = ${itemTotal} ₽\n\n`;
    }
  });
  
  message += `💰 Итого: ${total} ₽`;

  try {
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });

    if (response.ok) {
      statusMsg.style.color = 'green';
      statusMsg.textContent = 'Заказ успешно отправлен! Я свяжусь с вами.';
      localStorage.removeItem('a1_cart');
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
