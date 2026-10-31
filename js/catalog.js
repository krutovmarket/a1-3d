let allProducts = [];
let currentCategory = 'all';
let searchQuery = '';

fetch('data/products.json')
  .then(res => res.json())
    .then(data => {
    allProducts = data;
    
    // --- ЛОГИКА СОРТИРОВКИ ---
    const categoryOrder = {
      'chasovye': 1,
      'bruski': 2,
      'hranenie': 3,
      'pokraska': 4,
      'shablony': 5,
      'instrumenty': 6,
      'rashodniki': 7,
      'custom': 8
    };

    allProducts.sort((a, b) => {
      let orderA = categoryOrder[a.category] || 99;
      let orderB = categoryOrder[b.category] || 99;
      return orderA - orderB;
    });
    // -------------------------

    updateCounters();
    
    const urlParams = new URLSearchParams(window.location.search);
    const catParam = urlParams.get('cat');
    
    if (catParam) {
      currentCategory = catParam;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.style.borderColor = 'var(--border)';
        b.style.color = 'var(--text)';
        if (b.getAttribute('data-filter') === catParam) {
          b.style.borderColor = 'var(--accent)';
          b.style.color = 'var(--accent)';
        }
      });
    }
    
    filterAndRender();
  });

function filterAndRender() {
  let filtered = allProducts;
  if (currentCategory !== 'all') filtered = filtered.filter(p => p.category === currentCategory);
  if (searchQuery) {
    const lowerQuery = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(lowerQuery) || p.id.toString().includes(lowerQuery));
  }
  renderProducts(filtered);
}

function renderProducts(products) {
  const container = document.getElementById('product-container');
  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: var(--text-muted); font-size: 18px;">По вашему запросу ничего не найдено 😔</p>';
    return;
  }

  const wishlist = JSON.parse(localStorage.getItem('a1_wishlist')) || [];

  products.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    
    const isWished = wishlist.includes(product.id);
    const imageHtml = product.image ? `<img src="${product.image}" style="width:100%; height:100%; object-fit:cover;">` : 'Фото товара';

    card.innerHTML = `
      <div style="position: relative;">
        <button class="wishlist-btn" data-id="${product.id}" style="position: absolute; top: 10px; right: 10px; z-index: 10; background: var(--surface); border: 1px solid var(--border); border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 18px; display: flex; align-items: center; justify-content: center;">${isWished ? '❤️' : '🤍'}</button>
        <a href="product.html?id=${product.id}" style="display: flex; flex-direction: column; flex: 1; text-decoration: none; color: inherit;">
          <div class="product-thumb">${imageHtml}</div>
          <div class="product-body">
            <span style="font-size: 12px; color: var(--text-muted);">Артикул: ${product.id}</span>
            <h3>${product.title}</h3>
            <div class="product-price">${product.price}</div>
          </div>
        </a>
      </div>
      <div class="product-actions" style="display: flex; flex-direction: column; gap: 10px;">
        <a href="product.html?id=${product.id}" class="btn btn-outline" style="width: 100%;">Подробнее</a>
        <button class="btn btn-primary add-to-cart" data-id="${product.id}">В корзину</button>
      </div>
    `;

    // Обработчик избранного
    card.querySelector('.wishlist-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const added = toggleWishlist(product.id);
      e.target.textContent = added ? '❤️' : '🤍';
    });

    // Обработчик добавления в корзину
    card.querySelector('.add-to-cart').addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(e.target.getAttribute('data-id'));
      addToCart(id);
    });

    container.appendChild(card);
  });
}

// Фильтры
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.style.borderColor = 'var(--border)';
      b.style.color = 'var(--text)';
    });
    e.target.style.borderColor = 'var(--accent)';
    e.target.style.color = 'var(--accent)';

    currentCategory = e.target.getAttribute('data-filter');
    filterAndRender();
  });
});

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    filterAndRender();
  });
}

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem('a1_cart')) || [];
  let existingItemIndex = cart.findIndex(item => (typeof item === 'object' ? item.id === id && item.config === null : item === id));

  if (existingItemIndex !== -1) {
    if (typeof cart[existingItemIndex] === 'object') cart[existingItemIndex].qty += 1;
    else cart[existingItemIndex] = { id: id, qty: 2, config: null };
  } else {
    cart.push({ id: id, qty: 1, config: null });
  }
  
  localStorage.setItem('a1_cart', JSON.stringify(cart));
  alert('Товар добавлен в корзину!');
  updateCounters();
}


