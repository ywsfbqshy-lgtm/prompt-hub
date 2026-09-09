/* Prompt Hub - Mobile Glassmorphism Bottom Navigation Bar */
import { store } from '../store.js';
import { openCreatePromptModal } from './createModal.js';

export function renderBottomNav() {
  const container = document.getElementById('bottom-nav-container');
  if (!container) return;

  const state = store.getState();
  const currentView = state.currentView;

  container.innerHTML = `
    <div class="bottom-nav-item ${currentView === 'feed' ? 'active' : ''}" data-nav="feed">
      <span style="font-size: 1.25rem;">🏠</span>
      <span>الرئيسية</span>
    </div>

    <div class="bottom-nav-item ${currentView === 'explore' || currentView === 'search' ? 'active' : ''}" data-nav="explore">
      <span style="font-size: 1.25rem;">🔍</span>
      <span>استكشف</span>
    </div>

    <div class="bottom-nav-item" data-nav="create">
      <div class="create-btn-icon">➕</div>
    </div>

    <div class="bottom-nav-item ${currentView === 'notifications' ? 'active' : ''}" data-nav="notifications" style="position: relative;">
      <span style="font-size: 1.25rem;">🔔</span>
      <span>الإشعارات</span>
      ${state.unreadNotificationsCount > 0 ? `<span class="badge-dot" style="top: 8px; right: 28%;"></span>` : ''}
    </div>

    <div class="bottom-nav-item ${currentView === 'profile' ? 'active' : ''}" data-nav="profile">
      <span style="font-size: 1.25rem;">👤</span>
      <span>حسابي</span>
    </div>
  `;

  container.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      if (nav === 'create') {
        openCreatePromptModal();
      } else {
        store.setCurrentView(nav);
      }
    });
  });
}
