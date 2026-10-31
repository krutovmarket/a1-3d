// --- УПРАВЛЕНИЕ ТЕМОЙ ---
(function () {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  const saved = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (systemDark ? 'dark' : 'light'));

  if (toggle && icon) {
    toggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      localStorage.setItem('theme', next);
    });
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀';
  }
})();

// --- СЧЕТЧИКИ (КОРЗИНА И ИЗБРАННОЕ) ---
function updateCounters() {
  const cart = JSON.parse(localStorage.getItem('a1_cart')) || [];
  const cartCounter = document.getElementById('cart-count');
  if (cartCounter) {
    cartCounter.textContent = cart.reduce((sum, item) => sum + (typeof item === 'object' ? item.qty : 1), 0);
  }

  const wishlist = JSON.parse(localStorage.getItem('a1_wishlist')) || [];
  const wishCounter = document.getElementById('wishlist-count');
  if (wishCounter) {
    wishCounter.textContent = wishlist.length;
  }
}

// --- ОБРАТНЫЙ ЗВОНОК (Модальное окно) ---
document.addEventListener('DOMContentLoaded', () => {
  // Вставляем модальное окно в конец body
  const modalHTML = `
    <div id="callback-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 1000; align-items: center; justify-content: center;">
      <div style="background: var(--surface); padding: 30px; border-radius: 12px; width: 90%; max-width: 400px; position: relative;">
        <button id="close-callback" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">&times;</button>
        <h3 style="margin-bottom: 10px; font-size: 22px;">Заказать звонок</h3>
        <p style="font-size: 14px; color: var(--text-muted); margin-bottom: 20px;">Оставьте свой номер, и я перезвоню вам в ближайшее время.</p>
        <form id="callback-form">
          <input type="text" id="cb-name" placeholder="Ваше имя" required style="width: 100%; padding: 12px; margin-bottom: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
          <input type="tel" id="cb-phone" placeholder="Ваш телефон" required style="width: 100%; padding: 12px; margin-bottom: 15px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);">
          <button type="submit" class="btn btn-primary" style="width: 100%;">Жду звонка</button>
          <p id="cb-status" style="margin-top: 10px; font-size: 14px; text-align: center;"></p>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  const modal = document.getElementById('callback-modal');
  const btn = document.getElementById('callback-btn');
  const closeBtn = document.getElementById('close-callback');
  
  if (btn) btn.addEventListener('click', () => modal.style.display = 'flex');
  if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
  
  // Закрытие по клику вне окна
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Отправка формы
  document.getElementById('callback-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('cb-name').value;
    const phone = document.getElementById('cb-phone').value;
    const status = document.getElementById('cb-status');
    const submitBtn = e.target.querySelector('button');
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';

    const msg = `📞 ЗАКАЗ ЗВОНКА\n\n👤 Имя: ${name}\n📱 Телефон: ${phone}`;
    const URL = 'https://functions.yandexcloud.net/d4eufvmbprafagia9tj2';

    try {
      const res = await fetch(URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      if (res.ok) {
        status.style.color = 'green';
        status.textContent = 'Заявка отправлена! Я скоро перезвоню.';
        setTimeout(() => {
          modal.style.display = 'none';
          e.target.reset();
          status.textContent = '';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Жду звонка';
        }, 3000);
      } else throw new Error();
    } catch (err) {
      status.style.color = 'red';
      status.textContent = 'Ошибка. Попробуйте позвонить напрямую.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Жду звонка';
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  updateCounters();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// --- ГЛОБАЛЬНАЯ ФУНКЦИЯ ИЗБРАННОГО ---
function toggleWishlist(id) {
  let wishlist = JSON.parse(localStorage.getItem('a1_wishlist')) || [];
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(wId => wId !== id);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem('a1_wishlist', JSON.stringify(wishlist));
  updateCounters();
  return wishlist.includes(id);
}
