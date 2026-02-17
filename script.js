// Netflix Clone — Script
(function () {
  const rowTitles = [
    "Today's Top Picks for You",
    "Continue Watching",
    "Activating Hibernation Mode",
    "All Laughs, No Laugh Track",
    "Irreverent TV Shows",
    "Award-Winning Suspenseful TV Shows",
    "Action Sci-Fi",
    "New on Netflix",
    "Critically Acclaimed Movies",
    "Binge-Worthy Series"
  ];

  // Gather available thumbnails
  const thumbs = [];
  for (let i = 0; i < 20; i++) {
    const exts = ['webp', 'jpg', 'png'];
    for (const ext of exts) {
      thumbs.push(`assets/thumbnails/thumb-${String(i).padStart(2, '0')}.${ext}`);
    }
  }
  for (let i = 0; i < 20; i++) {
    thumbs.push(`assets/thumbnails/thumb-scroll-${String(i).padStart(2, '0')}.jpg`);
  }

  // Filter to thumbs that actually exist (we'll just use them; broken ones get fallback)
  const validThumbs = [];
  const movieTitles = [
    "Prometheus", "The Grand Budapest Hotel", "How to Get to Heaven from Belfast",
    "Unfamiliar", "Harlem Nights", "Reunion", "Bones", "Hunting Grounds",
    "The Rookie", "Blacklist", "Suits", "Brooklyn Nine-Nine", "Bridgerton",
    "Archer", "The Crown", "Ozark", "Stranger Things", "Wednesday",
    "Glass Onion", "The Watcher", "Dark", "Money Heist", "Lupin",
    "Squid Game", "Narcos", "Black Mirror", "Peaky Blinders", "The Witcher",
    "All Quiet on the Western Front", "Don't Look Up"
  ];

  // Build rows
  const container = document.getElementById('lolomo');
  let thumbIndex = 0;

  rowTitles.forEach((title, rowIdx) => {
    const row = document.createElement('div');
    row.className = 'lolomoRow';
    row.setAttribute('data-list-context', title.toLowerCase().replace(/\s/g, '-'));

    const itemCount = 12;
    let itemsHTML = '';
    for (let i = 0; i < itemCount; i++) {
      const ti = (rowIdx * 6 + i) % movieTitles.length;
      const thumbFile = getThumb(thumbIndex);
      thumbIndex++;

      const isTopPicksRow = rowIdx === 0;
      const showBadge = isTopPicksRow;
      const badgeHTML = showBadge ? `
        <svg class="badge-top10" viewBox="0 0 28 30"><rect width="28" height="30" fill="#b20710" rx="2"/><text x="14" y="22" text-anchor="middle" fill="white" font-size="14" font-weight="bold">10</text></svg>
      ` : '';
      const recentHTML = isTopPicksRow ? '<div class="badge-recently-added">Recently Added</div>' : '';

      itemsHTML += `
        <div class="slider-item slider-item-${i}">
          <div class="title-card-container" data-uia="title-card-container">
            <div class="title-card" data-title="${movieTitles[ti]}" data-thumb="${thumbFile}" data-preview="assets/videos/preview.webm">
              <div class="boxart-container boxart-rounded boxart-size-16x9">
                ${badgeHTML}
                <img class="boxart-image" src="${thumbFile}" alt="${movieTitles[ti]}" loading="lazy"
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="fallback-text-container" style="display:none; position:absolute; inset:0; align-items:center; justify-content:center; background: linear-gradient(135deg, #1a1a2e, #16213e);">
                  <p class="fallback-text" style="font-size:14px; text-align:center;">${movieTitles[ti]}</p>
                </div>
                ${recentHTML}
              </div>
            </div>
          </div>
        </div>
      `;
    }

    row.innerHTML = `
      <h2 class="rowHeader">
        <a class="rowTitle">
          <div class="row-header-title">${title}</div>
          <div class="aro-row-header">
            <span class="see-all-link">Explore All</span>
            <span>›</span>
          </div>
        </a>
      </h2>
      <div class="rowContainer">
        <button class="slider-arrow left" data-dir="-1">‹</button>
        <div class="slider">
          <div class="sliderMask">
            <div class="sliderContent">
              ${itemsHTML}
            </div>
          </div>
        </div>
        <button class="slider-arrow right" data-dir="1">›</button>
      </div>
    `;
    container.appendChild(row);
  });

  function getThumb(index) {
    // Cycle through available thumbs
    const i = index % 40;
    if (i < 20) {
      const exts = ['webp', 'jpg', 'png'];
      // thumb-00 is png, rest are mixed
      if (i === 0) return 'assets/thumbnails/thumb-00.png';
      return `assets/thumbnails/thumb-${String(i).padStart(2, '0')}.webp`;
    }
    return `assets/thumbnails/thumb-scroll-${String(i - 20).padStart(2, '0')}.jpg`;
  }

  // === SCROLL ARROWS ===
  document.querySelectorAll('.slider-arrow').forEach(btn => {
    btn.addEventListener('click', () => {
      const mask = btn.closest('.rowContainer').querySelector('.sliderMask');
      const scrollAmt = mask.clientWidth * 0.8;
      const dir = parseInt(btn.dataset.dir);
      mask.scrollBy({ left: dir * scrollAmt, behavior: 'smooth' });
    });
  });

  // === NAV SCROLL EFFECT ===
  const header = document.querySelector('.pinning-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  });

  // === HOVER PREVIEW ===
  const previewModal = document.getElementById('previewModal');
  const previewVideo = previewModal.querySelector('.preview-video');
  const previewClose = document.getElementById('previewClose');
  let hoverTimeout = null;
  let currentCard = null;

  document.addEventListener('mouseover', (e) => {
    const card = e.target.closest('.title-card');
    if (!card || card === currentCard) return;

    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      showPreview(card);
    }, 600);
  });

  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.title-card');
    if (!card) return;
    const related = e.relatedTarget;
    if (related && (related.closest('.title-card') === card || related.closest('.preview-modal'))) return;
    clearTimeout(hoverTimeout);
  });

  previewModal.addEventListener('mouseleave', () => {
    hidePreview();
  });

  previewClose.addEventListener('click', hidePreview);

  function showPreview(card) {
    currentCard = card;
    const rect = card.getBoundingClientRect();
    const previewSrc = card.dataset.preview;

    previewVideo.src = previewSrc;
    previewVideo.play().catch(() => {});

    // Position
    let left = rect.left + rect.width / 2 - 175;
    let top = rect.top - 30;
    if (left < 10) left = 10;
    if (left + 350 > window.innerWidth) left = window.innerWidth - 360;
    if (top < 10) top = rect.bottom + 10;

    previewModal.style.left = left + 'px';
    previewModal.style.top = top + 'px';
    previewModal.classList.add('visible');
  }

  function hidePreview() {
    previewModal.classList.remove('visible');
    previewVideo.pause();
    currentCard = null;
  }

  // === DETAIL MODAL (expand) ===
  const detailModal = document.getElementById('detailModal');
  const detailClose = document.getElementById('detailClose');
  const detailVideo = detailModal.querySelector('.detail-video');
  const detailTitle = detailModal.querySelector('.detail-title');
  const previewExpand = document.getElementById('previewExpand');

  // Click on card opens detail
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.title-card');
    if (!card) return;
    if (e.target.closest('.preview-modal')) return;
    openDetail(card.dataset.title);
  });

  previewExpand.addEventListener('click', () => {
    if (currentCard) {
      openDetail(currentCard.dataset.title);
      hidePreview();
    }
  });

  function openDetail(title) {
    detailTitle.textContent = title || 'Untitled';
    detailVideo.play().catch(() => {});
    detailModal.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  detailClose.addEventListener('click', () => {
    detailModal.classList.remove('visible');
    detailVideo.pause();
    document.body.style.overflow = '';
  });

  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.remove('visible');
      detailVideo.pause();
      document.body.style.overflow = '';
    }
  });

  // === SIMULATED USER SESSION ===
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  const heroVideo = document.querySelector('.hero-video');

  function smoothScroll(targetY, duration) {
    return new Promise(resolve => {
      const startY = window.scrollY;
      const diff = targetY - startY;
      const start = performance.now();
      function step(ts) {
        const p = Math.min((ts - start) / duration, 1);
        const ease = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
        window.scrollTo(0, startY + diff * ease);
        if (p < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function simulateSession() {
    // 1) Start at top, hero video plays for 10s
    window.scrollTo(0, 0);
    heroVideo.currentTime = 0;
    heroVideo.play().catch(() => {});
    await wait(10000);

    // 2) Scroll down to middle in 2s
    heroVideo.pause();
    await smoothScroll(800, 2000);

    // 3) Sit idle for 10s (no hover, nothing playing)
    await wait(10000);

    // 4) Hover over a thumbnail — trigger preview popup, play 10s
    const card = document.querySelector('.slider-item:nth-child(3) .title-card');
    if (card) {
      showPreview(card);
      previewVideo.currentTime = 0;
      previewVideo.play().catch(() => {});
      await wait(10000);
      hidePreview();
    }

    // 5) Scroll back to top → repeat from step 1
    await smoothScroll(0, 2000);
    await wait(500);
    simulateSession();
  }

  simulateSession();

})();
