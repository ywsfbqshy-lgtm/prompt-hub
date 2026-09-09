/* Prompt Hub - Desktop Sidebar & Mobile Header Component */
import { store } from '../store.js';
import { openCreatePromptModal } from './createModal.js';
import { openAuthGateModal } from './authGateModal.js';

export function renderSidebar() {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const state = store.getState();
  const currentUser = state.currentUser;
  const currentView = state.currentView;

  container.innerHTML = `
    <div>
      <!-- Brand Logo -->
      <a href="#" class="sidebar-logo" id="nav-logo">
        <div class="logo-icon">🚀</div>
        <span>Prompt Hub</span>
      </a>

      <!-- Menu Navigation Links -->
      <ul class="sidebar-menu">
        <li class="sidebar-item ${currentView === 'feed' ? 'active' : ''}" data-nav="feed">
          <span style="font-size: 1.2rem;">🏠</span>
          <span>الرئيسية (Feed)</span>
        </li>
        
        <li class="sidebar-item ${currentView === 'explore' ? 'active' : ''}" data-nav="explore">
          <span style="font-size: 1.2rem;">🔍</span>
          <span>استكشف Prompts</span>
        </li>

        <li class="sidebar-item" data-nav="create" style="color: var(--primary); font-weight: 700;">
          <span style="font-size: 1.2rem;">➕</span>
          <span>إنشاء Prompt جديد</span>
        </li>

        <li class="sidebar-item ${currentView === 'saved' ? 'active' : ''}" data-nav="saved">
          <span style="font-size: 1.2rem;">🔖</span>
          <span>المحفوظات</span>
        </li>

        <li class="sidebar-item ${currentView === 'notifications' ? 'active' : ''}" data-nav="notifications">
          <span style="font-size: 1.2rem;">🔔</span>
          <span>الإشعارات</span>
          ${state.unreadNotificationsCount > 0 ? `<span class="badge-dot"></span>` : ''}
        </li>

        <li class="sidebar-item ${currentView === 'profile' ? 'active' : ''}" data-nav="profile">
          <span style="font-size: 1.2rem;">👤</span>
          <span>الملف الشخصي</span>
        </li>
      </ul>
    </div>

    <!-- Sidebar Footer -->
    <div class="sidebar-footer">
      <li class="sidebar-item ${currentView === 'settings' ? 'active' : ''}" data-nav="settings">
        <span style="font-size: 1.1rem;">⚙️</span>
        <span>الإعدادات واللغة</span>
      </li>

      ${currentUser ? `
        <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-top: 0.5rem;">
          <img src="${currentUser.avatar}" class="avatar avatar-sm" alt="${currentUser.full_name}">
          <div style="flex: 1; overflow: hidden;">
            <div style="font-weight: 700; font-size: 0.85rem; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${currentUser.full_name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary);">@${currentUser.username}</div>
          </div>
          <button id="sidebar-logout-btn" class="btn btn-ghost btn-sm" title="تسجيل الخروج" style="padding: 0.3rem;">
            🚪
          </button>
        </div>
      ` : `
        <button id="sidebar-login-btn" class="btn btn-primary btn-block">
          تسجيل الدخول 🚀
        </button>
      `}
    </div>
  `;

  // Attach Sidebar Handlers
  container.querySelectorAll('[data-nav]').forEach(item => {
    item.addEventListener('click', () => {
      const nav = item.dataset.nav;
      if (nav === 'create') {
        openCreatePromptModal();
      } else if (nav === 'saved') {
        if (!currentUser) {
          openAuthGateModal('عرض العناصر المحفوظة');
        } else {
          store.setCurrentView('profile', { profileTab: 'saved' });
        }
      } else {
        store.setCurrentView(nav);
      }
    });
  });

  document.getElementById('sidebar-logout-btn')?.addEventListener('click', () => {
    if (confirm('هل تريد تسجيل الخروج من Prompt Hub؟')) {
      store.logout();
    }
  });

  document.getElementById('sidebar-login-btn')?.addEventListener('click', () => {
    store.setCurrentView('auth', { authMode: 'login' });
  });
}

export function renderMobileHeader() {
  const container = document.getElementById('mobile-header-container');
  if (!container) return;

  const state = store.getState();
  const currentUser = state.currentUser;

  container.innerHTML = `
    <a href="#" class="sidebar-logo" style="margin-bottom: 0; font-size: 1.15rem;">
      <div class="logo-icon" style="width: 32px; height: 32px; font-size: 1rem;">🚀</div>
      <span>Prompt Hub</span>
    </a>

    <div style="display: flex; align-items: center; gap: 0.6rem;">
      <button class="action-icon-btn" id="mobile-header-search" style="padding: 0.4rem;">
        🔍
      </button>

      <button class="action-icon-btn" id="mobile-header-notif" style="padding: 0.4rem; position: relative;">
        🔔
        ${state.unreadNotificationsCount > 0 ? `<span class="badge-dot" style="top: 4px; left: 4px;"></span>` : ''}
      </button>

      ${currentUser ? `
        <img src="${currentUser.avatar}" class="avatar avatar-xs" id="mobile-header-avatar" alt="${currentUser.full_name}" style="cursor: pointer;">
      ` : `
        <button class="btn btn-primary btn-sm" id="mobile-header-login">
          دخول
        </button>
      `}
    </div>
  `;

  document.getElementById('mobile-header-search')?.addEventListener('click', () => store.setCurrentView('search'));
  document.getElementById('mobile-header-notif')?.addEventListener('click', () => store.setCurrentView('notifications'));
  document.getElementById('mobile-header-avatar')?.addEventListener('click', () => store.setCurrentView('profile'));
  document.getElementById('mobile-header-login')?.addEventListener('click', () => store.setCurrentView('auth', { authMode: 'login' }));
}
