// 讀取 products.json 並畫出商品卡片。
// 上架：在 products.json 裡新增一個物件（images 是一個網址陣列，可放多張照片）。
// 售出後下架：把該物件從 products.json 陣列裡刪掉，存檔、推上 GitHub 即可。

let PRODUCTS = [];
let lightboxIndex = 0;   // 目前燈箱開著的是哪個商品
let lightboxPhoto = 0;   // 該商品目前看到第幾張照片

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');

  try {
    const res = await fetch(`products.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('無法讀取商品資料');
    PRODUCTS = await res.json();

    if (!PRODUCTS.length) {
      emptyState.hidden = false;
      return;
    }

    grid.innerHTML = PRODUCTS.map(renderCard).join('');
    bindCardEvents();
  } catch (err) {
    console.error(err);
    emptyState.textContent = '商品資料讀取失敗，請稍後再整理一次。';
    emptyState.hidden = false;
  }
}

function renderCard(item, index) {
  const name = escapeHtml(item.name || '未命名鞋款');
  const size = item.size ? `尺寸 ${escapeHtml(item.size)}` : '';
  const condition = item.condition ? escapeHtml(item.condition) : '';
  const price = item.price ? `NT$ ${Number(item.price).toLocaleString()}` : '私訊詢價';
  const images = (item.images && item.images.length)
    ? item.images
    : ['https://placehold.co/600x600?text=%E9%9E%8B%E7%85%A7'];
  const isNew = item.tag ? `<span class="card-tag">${escapeHtml(item.tag)}</span>` : '';
  // 進場動畫依序延遲，讓卡片一個一個出現，並封頂避免商品一多就等太久
  const delay = Math.min(index * 70, 500);

  return `
    <article class="card" style="animation-delay:${delay}ms" data-index="${index}">
      <div class="card-photo-wrap" data-open-lightbox="${index}">
        <img class="card-photo" src="${images[0]}" alt="${name}" loading="lazy">
        ${images.length > 1 ? `<span class="card-photo-count">1 / ${images.length}</span>` : ''}
      </div>
      <div class="card-body">
        <h2 class="card-name">${name}</h2>
        <p class="card-meta">${[size, condition].filter(Boolean).join(' ・ ')}</p>
        ${isNew}
        <p class="card-price">${price}</p>
      </div>
    </article>
  `;
}

function bindCardEvents() {
  document.querySelectorAll('[data-open-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      openLightbox(Number(el.dataset.openLightbox));
    });
  });
}

// ---- 燈箱邏輯 ----

function openLightbox(productIndex) {
  lightboxIndex = productIndex;
  lightboxPhoto = 0;
  document.getElementById('lightbox').hidden = false;
  document.body.style.overflow = 'hidden';
  renderLightboxPhoto();
}

function closeLightbox() {
  document.getElementById('lightbox').hidden = true;
  document.body.style.overflow = '';
}

function stepLightbox(delta) {
  const images = PRODUCTS[lightboxIndex].images || [];
  if (!images.length) return;
  lightboxPhoto = (lightboxPhoto + delta + images.length) % images.length;
  renderLightboxPhoto();
}

function renderLightboxPhoto() {
  const images = PRODUCTS[lightboxIndex].images || [];
  const img = document.getElementById('lightbox-img');
  const count = document.getElementById('lightbox-count');
  img.src = images[lightboxPhoto];
  img.alt = PRODUCTS[lightboxIndex].name || '';
  count.textContent = images.length > 1 ? `${lightboxPhoto + 1} / ${images.length}` : '';
  // 只有多張照片時才顯示上一張/下一張按鈕
  const showNav = images.length > 1;
  document.querySelector('.lightbox-prev').style.display = showNav ? 'block' : 'none';
  document.querySelector('.lightbox-next').style.display = showNav ? 'block' : 'none';
}

document.getElementById('lightbox').addEventListener('click', (e) => {
  if (e.target.id === 'lightbox') closeLightbox(); // 點背景關閉
});
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
document.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
document.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));

document.addEventListener('keydown', (e) => {
  if (document.getElementById('lightbox').hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLightbox(-1);
  if (e.key === 'ArrowRight') stepLightbox(1);
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadProducts();
