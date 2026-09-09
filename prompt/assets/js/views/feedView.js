/* Prompt Hub - Home Feed View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { renderPromptCard, attachPromptCardEvents } from '../components/promptCard.js';

export async function renderFeedView(mainContainer, rightPanelContainer) {
  const state = store.getState();
  const currentUser = state.currentUser;

  // Determine Greeting based on current hour
  const hour = new Date().getHours();
  let greeting = 'مرحبًا بك 🌙';
  if (hour >= 5 && hour < 12) greeting = 'صباح الخير 🌅';
  else if (hour >= 12 && hour < 18) greeting = 'مساء الخير 🌆';

  const nameDisplay = currentUser ? currentUser.full_name.split(' ')[0] : 'عزيزي الزائر';

  // Categories Bar
  const categories = await api.getCategories();
  const selectedCat = state.selectedCategory || 'all';

  mainContainer.innerHTML = `
    <!-- Header Greeting Banner -->
    <div style="margin-bottom: 1.25rem;">
      <h1 style="font-size: 1.45rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.2rem;">
        ${greeting}، ${nameDisplay} 👋
      </h1>
      <p style="font-size: 0.88rem; color: var(--text-secondary);">ماذا تريد أن تكتشف وتنسخ اليوم من أوامر AI؟</p>
    </div>

    <!-- Story-like Categories Horizontal Scroll Bar -->
    <div class="categories-bar">
      ${categories.map(cat => `
        <button class="category-chip ${selectedCat === cat.id ? 'active' : ''}" data-cat="${cat.id}">
          <span>${cat.icon}</span>
          <span>${cat.name}</span>
        </button>
      `).join('')}
    </div>

    <!-- Feed Container -->
    <div id="feed-prompts-list">
      <!-- Skeleton Loaders -->
      <div class="skeleton-card">
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text" style="width: 80%;"></div>
      </div>
      <div class="skeleton-card">
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1rem;">
          <div class="skeleton skeleton-avatar"></div>
          <div style="flex: 1;">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-text" style="width: 40%;"></div>
          </div>
        </div>
        <div class="skeleton skeleton-text"></div>
      </div>
    </div>
  `;

  // Attach Category Click Handlers
  mainContainer.querySelectorAll('.category-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.cat;
      store.setCategory(catId);
    });
  });

  // Fetch Prompts & Render
  try {
    const prompts = await api.getPrompts({ category: selectedCat });
    const feedList = document.getElementById('feed-prompts-list');

    if (!feedList) return;

    if (prompts.length === 0) {
      feedList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🤖</div>
          <div class="empty-state-title">لا توجد Prompts في هذا التصنيف</div>
          <div class="empty-state-desc">كن أول من ينشر أمرًا جديدًا في هذا التصنيف وسيدعمك الجميع!</div>
          <button class="btn btn-primary" id="empty-feed-create-btn">
            ➕ نشر Prompt جديد
          </button>
        </div>
      `;
      document.getElementById('empty-feed-create-btn')?.addEventListener('click', () => {
        store.setCurrentView('create');
      });
      return;
    }

    feedList.innerHTML = prompts.map(p => renderPromptCard(p)).join('');
    attachPromptCardEvents(feedList);

  } catch (err) {
    console.error(err);
    document.getElementById('feed-prompts-list').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">حدث خطأ أثناء تحميل البيانات</div>
        <div class="empty-state-desc">يرجى التحقق من الاتصال وإعادة المحاولة</div>
        <button class="btn btn-secondary" onclick="location.reload()">إعادة المحاولة 🔄</button>
      </div>
    `;
  }

  // Render Desktop Right Panel Widgets
  if (rightPanelContainer) {
    renderRightPanelWidgets(rightPanelContainer);
  }
}

// Right Panel Widgets (Trending & Top Creators Leaderboard)
async function renderRightPanelWidgets(container) {
  const trendingPrompts = await api.getPrompts({ category: 'trending' });
  
  container.innerHTML = `
    <!-- Search Widget Input -->
    <div class="search-bar-wrap">
      <span class="search-icon">🔍</span>
      <input type="text" id="right-panel-search-input" class="search-input" placeholder="ابحث عن Prompt أو وسم...">
    </div>

    <!-- 🔥 Trending Widget -->
    <div style="background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 1.1rem;">
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.85rem; display: flex; align-items: center; justify-content: space-between;">
        <span>🔥 Prompts الأكثر انتشارًا</span>
        <span style="font-size: 0.75rem; color: var(--primary); cursor: pointer;" id="view-all-trending">عرض الكل</span>
      </h3>

      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${trendingPrompts.slice(0, 3).map(tp => `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border-color);" data-action="open-detail" data-id="${tp.id}">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem; color: var(--text-primary); line-height: 1.3; margin-bottom: 0.2rem;">${tp.title}</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">بواسطة @${tp.author.username}</div>
            </div>
            <span class="badge badge-chatgpt" style="font-size: 0.7rem; flex-shrink: 0;">❤️ ${tp.likes_count}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 🏆 Top Creators Widget -->
    <div style="background-color: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); padding: 1.1rem;">
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 0.85rem;">
        🏆 أفضل المبدعين هذا الأسبوع
      </h3>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" class="avatar avatar-sm">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">أحمد المتولي</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">1.4K متابع</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm">متابعة</button>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" class="avatar avatar-sm">
            <div>
              <div style="font-weight: 700; font-size: 0.85rem;">سارة العلمي</div>
              <div style="font-size: 0.75rem; color: var(--text-secondary);">2.8K متابع</div>
            </div>
          </div>
          <button class="btn btn-outline btn-sm">متابعة</button>
        </div>
      </div>
    </div>

    <div style="font-size: 0.75rem; color: var(--text-muted); text-align: center; margin-top: auto;">
      Prompt Hub © 2026 — منصة الذكاء الاصطناعي الاجتماعية
    </div>
  `;

  document.getElementById('right-panel-search-input')?.addEventListener('focus', () => {
    store.setCurrentView('search');
  });

  document.getElementById('view-all-trending')?.addEventListener('click', () => {
    store.setCategory('trending');
  });
}
