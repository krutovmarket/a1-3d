const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));
let currentProduct = null;

const standardSizes = ["18 прямой", "18/16", "20 прямой", "20/16", "20/18", "22 прямой", "22/18", "22/20", "24 прямой", "24/18", "24/20", "24/22"];
const allSizes = ["12 прямой", "14 прямой", "14/12", "16 прямой", "16/14", "18 прямой", "18/16", "20 прямой", "20/16", "20/18", "21 прямой", "21/16", "21/18", "22 прямой", "22/18", "22/20", "23 прямой", "23/18", "23/20", "24 прямой", "24/18", "24/20", "24/22", "26 прямой", "26/22", "26/24", "27/20", "27/22", "27/24", "28/20", "28/22", "28/24", "28/26", "29/20", "29/22", "29/24", "29/26"];

if (!productId) {
  document.getElementById('product-title').textContent = 'Товар не найден';
} else {
  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      currentProduct = data.find(p => p.id === productId);
      
      if (!currentProduct) {
        document.getElementById('product-title').textContent = 'Товар не найден';
        return;
      }

      document.title = `${currentProduct.title} — Кожевники А1`;
      document.getElementById('breadcrumb-title').textContent = currentProduct.title;
      document.getElementById('product-title').textContent = currentProduct.title;
      document.getElementById('product-price').textContent = currentProduct.price;
      document.getElementById('product-desc').innerHTML = currentProduct.description;

      // --- 1. Конфигуратор КОРОБКИ ШАБЛОНОВ (ID 19) ---
      if (currentProduct.isBoxConfig) {
        const boxCfg = document.getElementById('box-configurator');
        if (boxCfg) {
          boxCfg.style.display = 'block';
          const boxQtySelect = document.getElementById('box-qty');
          const boxSizesList = document.getElementById('box-sizes-list');
          const bottomPriceDisplay = document.getElementById('box-price-display');
          
          function updateBoxPrice() {
            const qty = parseInt(boxQtySelect.value);
            const roundedPrice = Math.ceil((qty * 583) / 100) * 100;
            bottomPriceDisplay.textContent = roundedPrice + ' ₽'; 
          }

          function renderBoxSlots(qty) {
            boxSizesList.innerHTML = '';
            for (let i = 0; i < qty; i++) {
              const slotDiv = document.createElement('div');
              slotDiv.style = "margin-bottom: 10px; display: flex; gap: 10px; align-items: center;";
              const select = document.createElement('select');
              select.className = "box-slot-size";
              select.style = "flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text);";
              let defaultVal = i < standardSizes.length ? standardSizes[i] : "";
              let optionsHtml = `<option value="">--- Выберите размер ---</option>`;
              allSizes.forEach(size => {
                let selected = (size === defaultVal) ? 'selected' : '';
                optionsHtml += `<option value="${size}" ${selected}>${size}</option>`;
              });
              optionsHtml += `<option value="custom" style="font-weight: bold; color: var(--accent);">--- Свой размер ---</option>`;
              select.innerHTML = optionsHtml;

              const customInput = document.createElement('input');
              customInput.type = "text";
              customInput.placeholder = "Ваш размер";
              customInput.className = "box-custom-input";
              customInput.style = "display: none; flex: 1; padding: 8px; border-radius: 8px; border: 1px solid var(--accent); background: var(--bg); color: var(--text);";

              select.addEventListener('change', function() {
                customInput.style.display = (this.value === 'custom') ? 'block' : 'none';
              });

              slotDiv.appendChild(select);
              slotDiv.appendChild(customInput);
              boxSizesList.appendChild(slotDiv);
            }
          }
          updateBoxPrice();
          renderBoxSlots(12);
          boxQtySelect.addEventListener('change', function() { renderBoxSlots(parseInt(this.value)); updateBoxPrice(); });
        }
      }

      // --- 2. Конфигуратор ОРГАНАЙЗЕРА ШПУЛЬ (ID 50) ---
      if (currentProduct.isSpoolConfig) {
        const spoolCfg = document.getElementById('spool-configurator');
        if (spoolCfg) {
          spoolCfg.style.display = 'block';
          const typeSelect = document.getElementById('spool-type');
          const colsSelect = document.getElementById('spool-cols');
          const rowsSelect = document.getElementById('spool-rows');
          const totalDisplay = document.getElementById('spool-total');
          const bottomPriceDisplay = document.getElementById('spool-price-display');

          function updateRows() {
            const type = typeSelect.value;
            let maxRows = 7;
            if (type === '20') maxRows = 8;
            if (type === '32') maxRows = 6;
            let currentRow = parseInt(rowsSelect.value) || 5;
            rowsSelect.innerHTML = '';
            for (let i = 5; i <= maxRows; i++) {
              const opt = document.createElement('option');
              opt.value = i;
              opt.textContent = i + ' по вертикали';
              if (i === currentRow && currentRow <= maxRows) { opt.selected = true; } else if (i === maxRows && currentRow > maxRows) { opt.selected = true; }
              rowsSelect.appendChild(opt);
            }
            calculateSpool();
          }

          function calculateSpool() {
            const cols = parseInt(colsSelect.value);
            const rows = parseInt(rowsSelect.value);
            const total = cols * rows;
            totalDisplay.textContent = total;
            let basePrice = 600 + (total - 20) * (700 / 57);
            const format = document.querySelector('input[name="spool-variant"]:checked').value;
            if (format === 'Коробка') basePrice += 300;
            if (format === 'Стойка' || format === 'Ящик') basePrice += 400;
            const type = typeSelect.value;
            if (type === '20') basePrice = basePrice * 0.85;
            if (type === '32') basePrice = basePrice * 1.15;
            basePrice = Math.round(basePrice / 10) * 10;
            bottomPriceDisplay.textContent = basePrice + ' ₽'; 
          }

          typeSelect.addEventListener('change', updateRows);
          colsSelect.addEventListener('change', calculateSpool);
          rowsSelect.addEventListener('change', calculateSpool);
          document.querySelectorAll('input[name="spool-variant"]').forEach(r => r.addEventListener('change', calculateSpool));
          updateRows(); 
        }
      }

      // --- 3. Конфигуратор ЛАПОК (ID 15) ---
      if (currentProduct.isLapkiConfig) {
        const lapkiCfg = document.getElementById('lapki-configurator');
        if (lapkiCfg) {
          lapkiCfg.style.display = 'block';
          const cellsSelect = document.getElementById('lapki-cells');
          const bottomPriceDisplay = document.getElementById('lapki-price-display');
          function calculateLapki() {
            const cells = parseInt(cellsSelect.value);
            bottomPriceDisplay.textContent = (600 + (cells - 6) * 100) + ' ₽'; 
          }
          cellsSelect.addEventListener('change', calculateLapki);
          calculateLapki(); 
        }
      }

      // --- 4. Конфигуратор КОЛЕСА (ID 17) ---
      if (currentProduct.isKolesoConfig) {
        const kolesoCfg = document.getElementById('koleso-configurator');
        if (kolesoCfg) {
          kolesoCfg.style.display = 'block';
          const bottomPriceDisplay = document.getElementById('koleso-price-display');
          const radios = document.querySelectorAll('input[name="koleso-variant"]');
          function calculateKoleso() {
            let price = 1900;
            for (let r of radios) { if (r.checked) { price = parseInt(r.value); break; } }
            bottomPriceDisplay.textContent = price + ' ₽';
          }
          radios.forEach(r => r.addEventListener('change', calculateKoleso));
          calculateKoleso();
        }
      }

      // --- 5. Конфигуратор ШАГА ПРОБОЙНИКА (ID 1) ---
      if (currentProduct.isStepConfig) {
        const stepCfg = document.getElementById('step-configurator');
        if (stepCfg) {
          stepCfg.style.display = 'block';
          const stepSelect = document.getElementById('step-select');
          const customBox = document.getElementById('step-custom-box');
          stepSelect.addEventListener('change', function() {
            customBox.style.display = (this.value === 'custom') ? 'block' : 'none';
          });
        }
      }

      // --- 6. Конфигуратор СУШИЛКИ МАКС (ID 3) ---
      if (currentProduct.isDryerConfig) {
        const dryerCfg = document.getElementById('dryer-configurator');
        if (dryerCfg) {
          dryerCfg.style.display = 'block';
          const bottomPriceDisplay = document.getElementById('dryer-price-display');
          const radios = document.querySelectorAll('input[name="dryer-variant"]');
          function calculateDryer() {
            let price = 800;
            for (let r of radios) { if (r.checked) { price = parseInt(r.value); break; } }
            bottomPriceDisplay.textContent = price + ' ₽';
          }
          radios.forEach(r => r.addEventListener('change', calculateDryer));
          calculateDryer();
        }
      }

      // --- 7. Конфигуратор СУШИЛКИ СРЕДНЕЙ (ID 4) ---
      if (currentProduct.isDryerMiddleConfig) {
        const dryerMiddleCfg = document.getElementById('dryer-middle-configurator');
        if (dryerMiddleCfg) {
          dryerMiddleCfg.style.display = 'block';
          const bottomPriceDisplay = document.getElementById('dryer-middle-price-display');
          const radios = document.querySelectorAll('input[name="dryer-middle-variant"]');
          function calculateDryerMiddle() {
            let price = 650;
            for (let r of radios) { if (r.checked) { price = parseInt(r.value); break; } }
            bottomPriceDisplay.textContent = price + ' ₽';
          }
          radios.forEach(r => r.addEventListener('change', calculateDryerMiddle));
          calculateDryerMiddle();
        }
      }

      // --- 8. Конфигуратор ВАННОЧКИ (ID 7) ---
      if (currentProduct.isVannaConfig) {
        const vannaCfg = document.getElementById('vanna-configurator');
        if (vannaCfg) {
          vannaCfg.style.display = 'block';
          const bottomPriceDisplay = document.getElementById('vanna-price-display');
          const radios = document.querySelectorAll('input[name="vanna-variant"]');
          function calculateVanna() {
            let price = 250;
            for (let r of radios) { if (r.checked) { price = parseInt(r.value); break; } }
            bottomPriceDisplay.textContent = price + ' ₽';
          }
          radios.forEach(r => r.addEventListener('change', calculateVanna));
          calculateVanna();
        }
      }

      // --- 9. Конфигуратор ПОДУМОВ LORO PIANA (ID 21) ---
      if (currentProduct.isPodiumConfig) {
        const podiumCfg = document.getElementById('podium-configurator');
        if (podiumCfg) {
          podiumCfg.style.display = 'block';
          const qtyInput = document.getElementById('podium-qty');
          const bottomPriceDisplay = document.getElementById('podium-price-display');
          function calculatePodium() {
            const qty = parseInt(qtyInput.value) || 1;
            const price = 800 + (qty - 1) * 300;
            bottomPriceDisplay.textContent = price + ' ₽';
          }
          qtyInput.addEventListener('input', calculatePodium);
          calculatePodium();
        }
      }

      // --- 10. Конфигуратор ЗАЖИМОВ (ID 31) ---
      if (currentProduct.isClipsConfig) {
        const clipsCfg = document.getElementById('clips-configurator');
        if (clipsCfg) {
          clipsCfg.style.display = 'block';
          const select = document.getElementById('clips-select');
          const qtyInput = document.getElementById('clips-qty');
          const priceDisplay = document.getElementById('clips-price-display');

          function calcClips() {
            const len = parseInt(select.value);
            let qty = parseInt(qtyInput.value) || 3;
            if (qty < 3) { qty = 3; qtyInput.value = 3; }
            let pricePerPiece = 70;
            if (len === 100) pricePerPiece = 50;
            if (len === 200) pricePerPiece = 100;
            priceDisplay.textContent = (pricePerPiece * qty) + ' ₽';
          }
          select.addEventListener('change', calcClips);
          qtyInput.addEventListener('input', calcClips);
          calcClips();
        }
      }

      // --- 11. Конфигуратор ШАБЛОНА ПОДУМОВ (ID 2) ---
      if (currentProduct.isCenterTemplateConfig) {
        const cfg = document.getElementById('center-template-configurator');
        if (cfg) {
          cfg.style.display = 'block';
          const radios = document.querySelectorAll('input[name="center-template-variant"]');
          const qtyBox = document.getElementById('center-template-qty-box');
          const qtyInput = document.getElementById('center-template-qty');
          const priceDisplay = document.getElementById('center-template-price-display');
          const sizesList = document.getElementById('center-template-sizes-list');

          function renderSizeSelects(qty) {
            sizesList.innerHTML = '';
            for (let i = 0; i < qty; i++) {
              const div = document.createElement('div');
              div.style = "margin-bottom: 10px;";
              let options = `<option value="">--- Выберите размер ---</option>`;
              allSizes.forEach(s => options += `<option value="${s}">${s}</option>`);
              div.innerHTML = `<select class="center-tpl-size" style="width:100%; padding:8px; border-radius:8px; border:1px solid var(--border); background:var(--bg); color:var(--text);">${options}</select>`;
              sizesList.appendChild(div);
            }
          }

          function calcPrice() {
            let price = 900;
            let val = '900';
            for (let r of radios) { if (r.checked) { val = r.value; break; } }
            
            if (val === '50') {
              qtyBox.style.display = 'block';
              const qty = parseInt(qtyInput.value) || 1;
              price = 50 * qty;
              renderSizeSelects(qty);
            } else {
              qtyBox.style.display = 'none';
              sizesList.innerHTML = ''; 
              if (val === '500_complect') price = 500;
              else price = parseInt(val);
            }
            priceDisplay.textContent = price + ' ₽';
          }
          radios.forEach(r => r.addEventListener('change', calcPrice));
          qtyInput.addEventListener('input', calcPrice);
          calcPrice();
        }
      }

      // --- 12. Конфигуратор РАДИУСНОГО ШАБЛОНА (ID 48 или 29) ---
      if (currentProduct.isRadiusConfig) {
        const cfg = document.getElementById('radius-configurator');
        if (cfg) {
          cfg.style.display = 'block';
          const container = document.getElementById('radius-items-container');
          const addBtn = document.getElementById('add-radius-btn');
          const priceDisplay = document.getElementById('radius-price-display');
          let selectedRadii = [3, 5, 7, 10];

          function renderRadii() {
            container.innerHTML = '';
            selectedRadii.forEach((val, index) => {
              const div = document.createElement('div');
              div.style = "display: flex; gap: 10px; align-items: center;";
              const removeBtn = selectedRadii.length > 4 
                ? `<button type="button" class="btn btn-outline remove-radius" data-index="${index}" style="padding: 5px 10px; border-color: #ffcccc; color: red;">✕</button>`
                : '';
              div.innerHTML = `
                <input type="number" class="radius-input" data-index="${index}" value="${val}" min="3" max="30" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 15px; outline: none;">
                <span style="font-size: 15px; color: var(--text-muted);">мм</span>
                ${removeBtn}
              `;
              container.appendChild(div);
            });

            document.querySelectorAll('.radius-input').forEach(inp => {
              inp.addEventListener('change', (e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 3) val = 3;
                if (val > 30) val = 30;
                e.target.value = val;
                const idx = parseInt(e.target.getAttribute('data-index'));
                selectedRadii[idx] = val;
              });
            });

            document.querySelectorAll('.remove-radius').forEach(btn => {
              btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                selectedRadii.splice(idx, 1);
                renderRadii();
                updatePrice();
              });
            });
            updatePrice();
          }

          function updatePrice() {
            priceDisplay.textContent = (selectedRadii.length * 70) + ' ₽';
          }

          addBtn.addEventListener('click', () => {
            selectedRadii.push(12);
            renderRadii();
          });
          renderRadii();
        }
      }

      // --- 13. Конфигуратор КАСТОМНОЙ КОРОБКИ (ID 42) ---
      if (currentProduct.isBoxCustomConfig) {
        const cfg = document.getElementById('box-custom-configurator');
        if (cfg) {
          cfg.style.display = 'block';
          const lInput = document.getElementById('box-l');
          const wInput = document.getElementById('box-w');
          const hInput = document.getElementById('box-h');
          const loopsSelect = document.getElementById('box-loops');
          const latchesSelect = document.getElementById('box-latches');
          const insertCheckbox = document.getElementById('box-insert');
          const insertCommentBox = document.getElementById('box-insert-comment-box');
          const insertPriceHint = document.getElementById('insert-price-hint');
          const priceDisplay = document.getElementById('box-custom-price-display');

          function calculateBox() {
            let L = Math.max(5, Math.min(19, parseInt(lInput.value) || 5));
            let W = Math.max(5, Math.min(19, parseInt(wInput.value) || 5));
            let H = Math.max(3, Math.min(19, parseInt(hInput.value) || 3));
            lInput.value = L; wInput.value = W; hInput.value = H;

            let volume = L * W * H;
            let minVol = 75;
            let maxVol = 6859;

            let basePrice = 300 + (volume - minVol) * ((1200 - 300) / (maxVol - minVol));
            basePrice = Math.round(basePrice / 10) * 10;

            let insertPrice = 100 + (volume - minVol) * ((500 - 100) / (maxVol - minVol));
            insertPrice = Math.round(insertPrice / 10) * 10;

            let extras = parseInt(loopsSelect.value) + parseInt(latchesSelect.value);
            let insertCost = 0;
            
            if (insertCheckbox.checked) {
              insertCost = insertPrice;
              insertCommentBox.style.display = 'block';
              insertPriceHint.textContent = `(+ ${insertPrice} ₽)`;
            } else {
              insertCommentBox.style.display = 'none';
              insertPriceHint.textContent = `(+ 100 ₽)`;
            }

            priceDisplay.textContent = (basePrice + extras + insertCost) + ' ₽';
          }

          [lInput, wInput, hInput].forEach(inp => {
            inp.addEventListener('input', calculateBox);
            inp.addEventListener('change', calculateBox);
          });
          loopsSelect.addEventListener('change', calculateBox);
          latchesSelect.addEventListener('change', calculateBox);
          insertCheckbox.addEventListener('change', calculateBox);
          calculateBox();
        }
      }

      // --- 14. Конфигуратор МОДУЛЬНОЙ СИСТЕМЫ (ID 36) ---
      if (currentProduct.isModularConfig) {
        const cfg = document.getElementById('modular-configurator');
        if (cfg) {
          cfg.style.display = 'block';
          const inputs = document.querySelectorAll('.mod-qty');
          const priceDisplay = document.getElementById('modular-price-display');

          function calculateModular() {
            let total = 0;
            inputs.forEach(inp => {
              let val = parseInt(inp.value) || 0;
              if (val < 0) { val = 0; inp.value = 0; }
              total += val * 400;
            });
            priceDisplay.textContent = total + ' ₽';
          }

          inputs.forEach(inp => {
            inp.addEventListener('input', calculateModular);
            inp.addEventListener('change', calculateModular);
          });
          calculateModular();
        }
      }

      // --- 15. ЛОГИКА ДЛЯ КЛИШЕ (ID 46) И 3D-ПЕЧАТИ (ID 51) ---
      if (currentProduct.isClishe || currentProduct.isCustomPrint) {
        if (currentProduct.isClishe) {
           const cfg = document.getElementById('clishe-configurator');
           if (cfg) cfg.style.display = 'block';
        }
        if (currentProduct.isCustomPrint) {
           const cfg = document.getElementById('custom-print-configurator');
           if (cfg) cfg.style.display = 'block';
           
           // Кнопки отправки для 3D-печати
           const descInput = document.getElementById('custom-print-desc');
           function handleSend(platform) {
              const text = descInput.value.trim();
              let msg = `🖨️ ЗАКАЗ 3D-ПЕЧАТИ\n\n`;
              msg += text ? `📝 Детали: ${text}` : `📝 Клиент перешел в чат.`;
              navigator.clipboard.writeText(msg).then(() => alert('Текст скопирован! Вставьте в чат.'));
              if (platform === 'vk') window.open('https://vk.com/a1leather', '_blank');
              else window.open('https://t.me/+79969590200', '_blank');
           }
           document.getElementById('send-custom-vk').addEventListener('click', () => handleSend('vk'));
           document.getElementById('send-custom-tg').addEventListener('click', () => handleSend('tg'));
        }
        // Скрываем кнопку корзины, если это клише или 3д-печать
        const addBtn = document.getElementById('add-to-cart-btn');
        if (addBtn) addBtn.style.display = 'none';
      }

      // --- 16. СТАНДАРТНЫЙ КОНФИГУРАТОР (ПОДИУМЫ, ШАБЛОН) ---
      if (currentProduct.config) {
        const cfgBox = document.getElementById('configurator-box');
        if (cfgBox) {
          cfgBox.style.display = 'block';
          if (currentProduct.config.thick !== true) document.getElementById('group-thick').style.display = 'none';
          if (currentProduct.config.shape !== true) document.getElementById('group-shape').style.display = 'none';
          if (currentProduct.config.qty !== true) document.getElementById('group-qty').style.display = 'none';
          
          const sizeSelect = document.getElementById('cfg-size');
          const customSizeBox = document.getElementById('custom-size-box');
          sizeSelect.addEventListener('change', function() { customSizeBox.style.display = (this.value === 'custom') ? 'block' : 'none'; });
        }
      }

      // --- ГАЛЕРЕЯ ---
      const galleryWrapper = document.getElementById('gallery-wrapper');
      if (galleryWrapper) {
        const images = (currentProduct.images && currentProduct.images.length > 0) ? currentProduct.images : ['static/images/placeholder.jpg'];
        images.forEach(imgSrc => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide';
          slide.innerHTML = `<img src="${imgSrc}" alt="${currentProduct.title}" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--border), var(--surface))';">`;
          galleryWrapper.appendChild(slide);
        });
        new Swiper(".gallerySwiper", { loop: true, pagination: { el: ".swiper-pagination", clickable: true }, navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" } });
      }

      // --- ДОБАВЛЕНИЕ В КОРЗИНУ ---
      const addBtn = document.getElementById('add-to-cart-btn');
      if (addBtn) {
        addBtn.addEventListener('click', () => {
          let cart = JSON.parse(localStorage.getItem('a1_cart')) || [];
          let cartItem = { id: currentProduct.id, qty: 1, config: null, customPrice: null };

          if (currentProduct.isBoxConfig) {
            const qty = parseInt(document.getElementById('box-qty').value);
            const selects = document.querySelectorAll('.box-slot-size');
            const inputs = document.querySelectorAll('.box-custom-input');
            let selectedSizes = [];
            for (let i = 0; i < selects.length; i++) {
              let val = selects[i].value;
              if (!val) { alert(`Выберите размер для шаблона №${i + 1}`); return; }
              if (val === 'custom') {
                let customVal = inputs[i].value.trim();
                if (!customVal) { alert(`Напишите размер для шаблона №${i + 1}`); return; }
                val = customVal + ' (кастом)';
              }
              selectedSizes.push(val);
            }
            const roundedPrice = Math.ceil((qty * 583) / 100) * 100;
            cartItem.customPrice = roundedPrice;
            cartItem.config = `Набор из ${qty} шт: ${selectedSizes.join(', ')}`;
          }
          else if (currentProduct.isSpoolConfig) {
            const selectedFormat = document.querySelector('input[name="spool-variant"]:checked').value;
            const typeSelect = document.getElementById('spool-type');
            const typeText = typeSelect.options[typeSelect.selectedIndex].text;
            const cols = document.getElementById('spool-cols').value;
            const rows = document.getElementById('spool-rows').value;
            const total = cols * rows;
            const bottomPriceDisplay = document.getElementById('spool-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = `${selectedFormat} | ${typeText} | Сетка ${cols}x${rows} (${total} шт.)`;
          }
          else if (currentProduct.isLapkiConfig) {
            const cells = document.getElementById('lapki-cells').value;
            const bottomPriceDisplay = document.getElementById('lapki-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = `На ${cells} ячеек`;
          }
          else if (currentProduct.isKolesoConfig) {
            let selectedVariant = document.querySelector('input[name="koleso-variant"]:checked').parentElement.querySelector('strong').textContent;
            const bottomPriceDisplay = document.getElementById('koleso-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = selectedVariant;
          }
          else if (currentProduct.isStepConfig) {
            let step = document.getElementById('step-select').value;
            if (step === 'custom') {
              step = document.getElementById('step-custom-input').value.trim();
              if (!step) { alert('Укажите свой шаг пробойника.'); return; }
              step = step + ' (кастом)';
            }
            cartItem.config = `Шаг: ${step}`;
          }
          else if (currentProduct.isDryerConfig) {
            let selectedVariant = document.querySelector('input[name="dryer-variant"]:checked').parentElement.querySelector('strong').textContent;
            const bottomPriceDisplay = document.getElementById('dryer-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = selectedVariant;
          }
          else if (currentProduct.isDryerMiddleConfig) {
            let selectedVariant = document.querySelector('input[name="dryer-middle-variant"]:checked').parentElement.querySelector('strong').textContent;
            const bottomPriceDisplay = document.getElementById('dryer-middle-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = selectedVariant;
          }
          else if (currentProduct.isVannaConfig) {
            let selectedVariant = document.querySelector('input[name="vanna-variant"]:checked').parentElement.querySelector('strong').textContent;
            const bottomPriceDisplay = document.getElementById('vanna-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = selectedVariant;
          }
          else if (currentProduct.isPodiumConfig) {
            const qty = parseInt(document.getElementById('podium-qty').value) || 1;
            const bottomPriceDisplay = document.getElementById('podium-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = `Подумов: ${qty} шт.`;
          }
          else if (currentProduct.isClipsConfig) {
            const length = document.getElementById('clips-select').value;
            const qty = parseInt(document.getElementById('clips-qty').value) || 3;
            const priceDisplay = document.getElementById('clips-price-display');
            let price = parseInt(priceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = `Длина: ${length} мм | ${qty} шт.`;
          }
          else if (currentProduct.isCenterTemplateConfig) {
            let selectedVariant = '';
            let val = '';
            const radios = document.querySelectorAll('input[name="center-template-variant"]');
            for (let r of radios) { if (r.checked) { val = r.value; break; } }
            
            if (val === '50') {
              const selects = document.querySelectorAll('.center-tpl-size');
              let chosenSizes = [];
              for (let sel of selects) {
                if (!sel.value) { alert('Пожалуйста, выберите размер для каждого шаблона из списка.'); return; }
                chosenSizes.push(sel.value);
              }
              selectedVariant = `Отдельные шаблоны (${chosenSizes.join(', ')})`;
            } else if (val === '500_complect') {
              selectedVariant = `Только комплект шаблонов вклейки (12 шт.)`;
            } else if (val === '500') {
              selectedVariant = `Только шаблон для склейки`;
            } else {
              selectedVariant = `Стандартный комплект (12 размеров + шаблон склейки)`;
            }
            const bottomPriceDisplay = document.getElementById('center-template-price-display');
            let price = parseInt(bottomPriceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = selectedVariant;
          }
          else if (currentProduct.isRadiusConfig) {
            let configParts = [];
            const inputs = document.querySelectorAll('.radius-input');
            inputs.forEach(inp => configParts.push(inp.value + ' мм'));
            const priceDisplay = document.getElementById('radius-price-display');
            let price = parseInt(priceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = `Набор: ${configParts.join(', ')}`;
          }
          else if (currentProduct.isBoxCustomConfig) {
            const L = document.getElementById('box-l').value;
            const W = document.getElementById('box-w').value;
            const H = document.getElementById('box-h').value;
            const loops = document.getElementById('box-loops').options[document.getElementById('box-loops').selectedIndex].text;
            const latches = document.getElementById('box-latches').options[document.getElementById('box-latches').selectedIndex].text;
            const hasInsert = document.getElementById('box-insert').checked;
            const insertText = document.getElementById('box-insert-text').value.trim();
            let configParts = [`Внутр. размеры: ${L}x${W}x${H} см`, loops, latches];
            if (hasInsert) configParts.push(`Ложемент (${insertText || 'без описания'})`);
            const priceDisplay = document.getElementById('box-custom-price-display');
            let price = parseInt(priceDisplay.textContent.replace(/[^\d]/g, ''));
            cartItem.customPrice = price;
            cartItem.config = configParts.join(' | ');
          }
          else if (currentProduct.isModularConfig) {
            const inputs = document.querySelectorAll('.mod-qty');
            let configParts = [];
            let totalCount = 0;
            inputs.forEach(inp => {
              let val = parseInt(inp.value) || 0;
              if (val > 0) {
                configParts.push(`${inp.getAttribute('data-name')} - ${val} шт.`);
                totalCount += val;
              }
            });
            if (totalCount === 0) { alert('Пожалуйста, добавьте хотя бы один модуль в систему.'); return; }
            let price = totalCount * 400;
            cartItem.customPrice = price;
            cartItem.config = configParts.join(', ');
          }
          else if (currentProduct.config) {
            let configParts = [];
            if (currentProduct.config.size) {
              let size = document.getElementById('cfg-size').value;
              if (!size) { alert('Выберите размер.'); return; }
              if (size === 'custom') {
                const customVal = document.getElementById('cfg-custom-size').value.trim();
                if (!customVal) { alert('Укажите свой размер.'); return; }
                size = customVal + ' (кастом)';
              }
              configParts.push(size);
            }
            if (currentProduct.config.thick) configParts.push(document.getElementById('cfg-thick').value);
            if (currentProduct.config.shape) configParts.push(document.getElementById('cfg-shape').value);
            cartItem.config = configParts.join(', ');
            if (currentProduct.config.qty === true) cartItem.qty = parseInt(document.getElementById('cfg-qty').value) || 1;
          }

          let existingItemIndex = cart.findIndex(item => { if (typeof item === 'object') return item.id === cartItem.id && item.config === cartItem.config; return false; });
          if (existingItemIndex !== -1) cart[existingItemIndex].qty += cartItem.qty;
          else cart.push(cartItem);

          localStorage.setItem('a1_cart', JSON.stringify(cart));
          alert('Добавлено в корзину!');
          updateCounters();
        });
      }
      updateCounters();
    })
    .catch(err => {
      console.error("Ошибка:", err);
      document.getElementById('product-title').textContent = 'Ошибка загрузки';
    });
}
