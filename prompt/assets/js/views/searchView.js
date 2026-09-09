/* Prompt Hub - Search & Filter View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { renderPromptCard, attachPromptCardEvents } from '../components/promptCard.js';
import { debounce } from '../utils/helpers.js';

export async function renderSearchView(mainContainer) {
  const state = store.getState();
  let currentSort = state.sortOption || 'trending';
  let currentSearchQuery = state.searchQuery || '';
  let activeTab = 'prompts'; // prompts | users | categories

  mainContainer.innerHTML = `
    <!-- Search Bar Input -->
    <div class="search-bar-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="live-search-input" class="search-input" placeholder="ابحث عن Prompt، وسم (#Python)، أو كاتب..." value="${currentSearchQuery}" autofocus>
    </div>

    <!-- Filter Tabs & Sort Dropdown -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
      <!-- Tabs -->
      <div style="display: flex; gap: 0.4rem;">
        <button class="btn btn-sm ${activeTab === 'prompts' ? 'btn-primary' : 'btn-secondary'}" data-tab="prompts">
          Prompts 🤖
        </button>
        <button class="btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}" data-tab="users">
          المبدعين 👤
        </button>
      </div>

      <!-- Sort Selection -->
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <span style="font-size: 0.8rem; color: var(--text-secondary);">ترتيب حسب:</span>
        <select id="sort-select" class="form-select" style="padding: 0.4rem 0.75rem; font-size: 0.85rem; width: auto;">
          <option value="trending" ${currentSort === 'trending' ? 'selected' : ''}>🔥 الشائعة</option>
          <option value="most_liked" ${currentSort === 'most_liked' ? 'selected' : ''}>❤️ الأكثر إعجابًا</option>
          <option value="most_copied" ${currentSort === 'most_copied' ? 'selected' : ''}>📋 الأكثر نسخًا</option>
          <option value="newest" ${currentSort === 'newest' ? 'selected' : ''}>🆕 الأحدث</option>
        </select>
      </div>
    </div>

    <!-- Search Results Container -->
    <div id="search-results-list"></div>
  `;

  const searchInput = document.getElementById('live-search-input');
  const sortSelect = document.getElementById('sort-select');
  const resultsContainer = document.getElementById('search-results-list');

  async function updateResults() {
    resultsContainer.innerHTML = `<div class="skeleton-card"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-text"></div></div>`;
    
    if (activeTab === 'prompts') {
      const prompts = await api.getPrompts({ search: currentSearchQuery, sort: currentSort });
      if (prompts.length === 0) {
        resultsContainer.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">🔍</div>
            <div class="empty-state-title">لم نجد نتائج مطابقة لـ "${currentSearchQuery}"</div>
            <div class="empty-state-desc">جرب التفتيش عن كلمات رئيسية أخرى مثل Python، تسويق، أو خطة مذاكرة</div>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = prompts.map(p => renderPromptCard(p)).join('');
      attachPromptCardEvents(resultsContainer);
    } else if (activeTab === 'users') {
      resultsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr; gap: 0.85rem;">
          <div class="prompt-card" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" class="avatar avatar-md">
              <div>
                <div style="font-weight: 700; font-size: 1rem;">أحمد المتولي</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">@ahmed_ai • 1.4K متابع</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm">متابعة +</button>
          </div>

          <div class="prompt-card" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" class="avatar avatar-md">
              <div>
                <div style="font-weight: 700; font-size: 1rem;">سارة العلمي</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">@sara_code • 2.8K متابع</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm">متابعة +</button>
          </div>
        </div>
      `;
    }
  }

  searchInput?.addEventListener('input', debounce(() => {
    currentSearchQuery = searchInput.value.trim();
    store.setSearchQuery(currentSearchQuery);
    updateResults();
  }, 250));

  sortSelect?.addEventListener('change', () => {
    currentSort = sortSelect.value;
    updateResults();
  });

  mainContainer.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      mainContainer.querySelectorAll('[data-tab]').forEach(b => b.className = 'btn btn-sm btn-secondary');
      btn.className = 'btn btn-sm btn-primary';
      updateResults();
    });
  });

  updateResults();
}
