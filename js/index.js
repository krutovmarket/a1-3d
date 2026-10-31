// Загружаем базу товаров
fetch('data/products.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('popular-container');
    container.innerHTML = '';
    
    // Берем ВСЕ товары (ничего не фильтруем)
    data.forEach(product => {
      
      const slide = document.createElement('div');
      slide.className = 'swiper-slide';
      
      const imageHtml = product.image 
        ? `<img src="${product.image}" alt="${product.title}" style="width:100%; height:100%; object-fit:cover;">`
        : 'Фото товара';

      // Внутри слайда - карточка товара
      slide.innerHTML = `
        <article class="product-card" style="width: 100%;">
          <a href="product.html?id=${product.id}" style="display: flex; flex-direction: column; flex: 1; text-decoration: none; color: inherit;">
            <div class="product-thumb">
              ${imageHtml}
            </div>
            <div class="product-body">
              <h3>${product.title}</h3>
              <div style="font-size: 13px; color: var(--text-muted); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px;">
                ${product.description || ''}
              </div>
              <div class="product-price">${product.price}</div>
            </div>
          </a>
          <div class="product-actions">
            <a href="product.html?id=${product.id}" class="btn btn-outline">Подробнее</a>
          </div>
        </article>
      `;

      container.appendChild(slide);
    });

    // Инициализируем карусель
    new Swiper(".popularSwiper", {
      slidesPerView: 1,
      spaceBetween: 20,
      loop: true, // Бесконечная прокрутка
      grabCursor: true,
      mousewheel: { forceToAxis: true },
      autoplay: { 
        delay: 12000, // Смена раз в 12 секунд
        disableOnInteraction: false 
      },
      pagination: { 
        el: ".swiper-pagination", 
        clickable: true 
      },
      navigation: { 
        nextEl: ".swiper-button-next", 
        prevEl: ".swiper-button-prev" 
      },
      breakpoints: {
        820: { slidesPerView: 2 }, // На планшетах 2 в ряд
        1024: { slidesPerView: 3 }, // На ПК 3 в ряд
      },
    });
  })
  .catch(err => {
    console.error("Ошибка загрузки популярных товаров:", err);
    document.getElementById('popular-container').innerHTML = '<p>Не удалось загрузить товары.</p>';
  });


