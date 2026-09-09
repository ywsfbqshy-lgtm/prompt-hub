/* Prompt Hub - Instagram-Style Explore View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { renderPromptCard, attachPromptCardEvents } from '../components/promptCard.js';

export async function renderExploreView(mainContainer) {
  const categories = await api.getCategories();
  const trendingPrompts = await api.getPrompts({ sort: 'trending' });
  const mostCopiedPrompts = await api.getPrompts({ sort: 'most_copied' });

  mainContainer.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.35rem;">استكشف عالم الـ Prompts 🚀</h1>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">استكشف أكثر الأوامر انتشارًا ونسخًا وتفاعلًا في المنصة</p>
    </div>

    <!-- Category Grid Cards -->
    <div style="margin-bottom: 1.75rem;">
      <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.85rem;">📂 اكتشف حسب التصنيف</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 0.75rem;">
        ${categories.slice(1).map(cat => `
          <div class="category-card" data-catid="${cat.id}" style="background-color: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem; text-align: center; cursor: pointer; transition: all var(--transition-fast);">
            <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">${cat.icon}</div>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-primary);">${cat.name}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 🔥 Trending Section -->
    <div style="margin-bottom: 1.75rem;">
      <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.85rem;">🔥 الأكثر انتشارًا اليوم</h2>
      <div id="explore-trending-list">
        ${trendingPrompts.slice(0, 2).map(p => renderPromptCard(p)).join('')}
      </div>
    </div>

    <!-- 📋 Most Copied Section -->
    <div>
      <h2 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 0.85rem;">📋 الأكثر نسخًا واستخدامًا</h2>
      <div id="explore-copied-list">
        ${mostCopiedPrompts.slice(0, 2).map(p => renderPromptCard(p)).join('')}
      </div>
    </div>
  `;

  // Attach Card Events
  const trendingList = document.getElementById('explore-trending-list');
  const copiedList = document.getElementById('explore-copied-list');
  
  if (trendingList) attachPromptCardEvents(trendingList);
  if (copiedList) attachPromptCardEvents(copiedList);

  // Category Click Handlers
  mainContainer.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const catId = card.dataset.catid;
      store.setCategory(catId);
    });
  });
}
