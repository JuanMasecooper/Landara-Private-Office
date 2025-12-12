// assets/articles.js
// Carga artículos listados en content/<section>/index.json
document.addEventListener('DOMContentLoaded', () => {
  initArticleAreas();
});

function initArticleAreas() {
  const areas = [
    { key: 'insights', containerId: 'insightsList' },
    { key: 'one-stop', containerId: 'onestopList' }
  ];
  areas.forEach(a => loadArticlesFor(a.key, a.containerId));
  createArticleModal();
}

async function loadArticlesFor(sectionKey, containerId) {
  const listUrl = `content/${sectionKey}/index.json`;
  try {
    const res = await fetch(encodeURI(listUrl));
    if (!res.ok) return console.warn('No index for', sectionKey, res.status);
    const items = await res.json();
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('article');
      card.className = 'article-card';
      card.innerHTML = `
        <h3 class="article-card__title">${escapeHtml(item.title)}</h3>
        <div class="article-card__meta">${escapeHtml(item.date || '')}</div>
        <p class="article-card__excerpt">${escapeHtml(item.excerpt || '')}</p>
        <button class="btn btn--ghost article-card__open" data-path="${encodeURI(item.path)}">Leer</button>
      `;
      card.querySelector('.article-card__open').addEventListener('click', (e) => {
        const path = e.currentTarget.dataset.path;
        openArticleModal(path);
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error cargando artículos', sectionKey, err);
  }
}

function createArticleModal() {
  if (document.getElementById('articleModal')) return;
  const modal = document.createElement('div');
  modal.id = 'articleModal';
  modal.className = 'article-modal';
  modal.innerHTML = `
    <div class="article-modal__backdrop" id="articleModalBackdrop"></div>
    <div class="article-modal__dialog" role="dialog" aria-modal="true">
      <button class="article-modal__close btn--small" id="articleModalClose">Cerrar</button>
      <div class="article-modal__content" id="articleModalContent"></div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('articleModalClose').addEventListener('click', closeArticleModal);
  document.getElementById('articleModalBackdrop').addEventListener('click', closeArticleModal);
}

async function openArticleModal(path) {
  const contentEl = document.getElementById('articleModalContent');
  contentEl.innerHTML = '<p class="muted">Cargando…</p>';
  const modal = document.getElementById('articleModal');
  modal.classList.add('is-open');
  try {
    const res = await fetch(path);
    if (!res.ok) {
      contentEl.innerHTML = `<p class="muted">No se pudo cargar el artículo (${res.status}).</p>`;
      return;
    }
    const html = await res.text();
    contentEl.innerHTML = html;
    contentEl.scrollTop = 0;
  } catch (err) {
    contentEl.innerHTML = '<p class="muted">Error cargando el artículo.</p>';
    console.error(err);
  }
}

function closeArticleModal() {
  const modal = document.getElementById('articleModal');
  if (modal) modal.classList.remove('is-open');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (s) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}
