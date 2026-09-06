// 讀取 products.json 並畫出商品卡片。
// 上架：在 products.json 裡新增一個物件。
// 售出後下架：把該物件從 products.json 陣列裡刪掉，存檔、推上 GitHub 即可。

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const emptyState = document.getElementById('empty-state');

  try {
    // 加上時間戳記避免瀏覽器快取到舊資料
    const res = await fetch(`products.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('無法讀取商品資料');
    const products = await res.json();

    if (!products.length) {
      emptyState.hidden = false;
      return;
    }

    grid.innerHTML = products.map(renderCard).join('');
  } catch (err) {
    console.error(err);
    emptyState.textContent = '商品資料讀取失敗，請稍後再整理一次。';
    emptyState.hidden = false;
  }
}

function renderCard(item) {
  const name = escapeHtml(item.name || '未命名鞋款');
  const size = item.size ? `尺寸 ${escapeHtml(item.size)}` : '';
  const condition = item.condition ? escapeHtml(item.condition) : '';
  const price = item.price ? `NT$ ${Number(item.price).toLocaleString()}` : '私訊詢價';
  const photo = item.image || 'https://placehold.co/500x500?text=%E9%9E%8B%E7%85%A7';
  const isNew = item.tag ? `<span class="card-tag">${escapeHtml(item.tag)}</span>` : '';

  return `
    <article class="card">
      <img class="card-photo" src="${photo}" alt="${name}" loading="lazy">
      <div class="card-body">
        <h2 class="card-name">${name}</h2>
        <p class="card-meta">${[size, condition].filter(Boolean).join(' ・ ')}</p>
        ${isNew}
        <p class="card-price">${price}</p>
      </div>
    </article>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadProducts();
