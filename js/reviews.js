// 1. ЗАГРУЗКА ОТЗЫВОВ ИЗ JSON И ИНИЦИАЛИЗАЦИЯ КАРУСЕЛИ
fetch('data/reviews.json')
  .then(res => res.json())
  .then(reviews => {
    const wrapper = document.getElementById('reviews-wrapper');
    wrapper.innerHTML = ''; // Очищаем "Загрузку"

    reviews.forEach(review => {
      // Рисуем звездочки в зависимости от оценки
      let starsHtml = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

      // Создаем карточку
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      slide.innerHTML = `
        <div class="review-card">
          <div class="review-header">
            <div>
              <span class="review-author">${review.author}</span> 
              <span class="review-source">${review.source}</span>
            </div>
            <span class="review-stars">${starsHtml}</span>
          </div>
          <div class="review-text">«${review.text}»</div>
        </div>
      `;
      wrapper.appendChild(slide);
    });

    // Инициализируем Swiper ТОЛЬКО после того, как карточки вставлены в HTML
    var swiper = new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true,
      grabCursor: true,
      mousewheel: { forceToAxis: true },
      autoplay: { delay: 12000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
      breakpoints: {
        820: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  })
  .catch(err => {
    console.error("Ошибка загрузки отзывов:", err);
    document.getElementById('reviews-wrapper').innerHTML = '<p>Не удалось загрузить отзывы.</p>';
  });


// 2. ОТПРАВКА НОВОГО ОТЗЫВА (в Telegram через Яндекс Облако)
const YANDEX_FUNCTION_URL = 'https://functions.yandexcloud.net/d4eufvmbprafagia9tj2';

document.getElementById('reviewForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('reviewName').value.trim();
  const rating = document.getElementById('reviewRating').value;
  const text = document.getElementById('reviewText').value.trim();
  const btn = document.getElementById('submitReviewBtn');
  const statusMsg = document.getElementById('reviewStatus');

  if (!name || !text) {
    statusMsg.style.color = 'red';
    statusMsg.textContent = 'Пожалуйста, заполните все поля.';
    return;
  }

  btn.textContent = 'Отправка...';
  btn.disabled = true;

  let message = `🌟 НОВЫЙ ОТЗЫВ С САЙТА\n\n👤 Автор: ${name}\n⭐ Оценка: ${rating} из 5\n\n📝 Текст:\n${text}`;

  try {
    const response = await fetch(YANDEX_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message })
    });

    if (response.ok) {
      statusMsg.style.color = 'green';
      statusMsg.textContent = 'Спасибо! Ваш отзыв отправлен на модерацию.';
      document.getElementById('reviewForm').reset();
    } else {
      throw new Error('Ошибка сервера');
    }
  } catch (error) {
    statusMsg.style.color = 'red';
    statusMsg.textContent = 'Ошибка при отправке. Попробуйте позже.';
  } finally {
    btn.textContent = 'Отправить отзыв';
    btn.disabled = false;
  }
});
