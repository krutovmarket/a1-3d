let allProducts = [];

// Загружаем товары из JSON
fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);
    updateCartCount();
  });

// Отрисовка карточек
function renderProducts(products) {
  const container = document.getElementById('product-container');
  container.innerHTML = '';

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-thumb">Фото товара</div>
      <div class="product-body">
        <h3>${product.title}</h3>
        <div class="product-price">${product.price}</div>
      </div>
      <div class="product-actions">
        <button class="btn btn-primary add-to-cart" data-id="${product.id}">В корзину</button>
      </div>
    `;
    container.appendChild(card);
  });

  // Добавляем обработчики на кнопки
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.getAttribute('data-id'));
      addToCart(id);
    });
  });
}

// Фильтрация
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Сброс стилей кнопок
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.style.borderColor = 'var(--border)';
      b.style.color = 'var(--text)';
    });
    // Выделение активной
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.color = 'var(--accent)';

    const filter = e.target.getAttribute('data-filter');
    if (filter === 'all') {
      renderProducts(allProducts);
    } else {
      renderProducts(allProducts.filter(p => p.category === filter));
    }
  });
});

// --- Логика корзины ---
function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem('a1_cart')) || [];
  
  // Проверяем, есть ли уже этот товар
  if (!cart.includes(id)) {
    cart.push(id);
    localStorage.setItem('a1_cart', JSON.stringify(cart));
    alert('Товар добавлен в корзину!');
    updateCartCount();
  } else {
    alert('Этот товар уже в корзине.');
  }
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('a1_cart')) || [];
  document.getElementById('cart-count').textContent = cart.length;
}
