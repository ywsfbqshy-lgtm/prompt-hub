/* Prompt Hub - Notifications Center View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { timeAgo } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { openAuthGateModal } from '../components/authGateModal.js';

export async function renderNotificationsView(mainContainer) {
  const state = store.getState();
  if (!state.currentUser) {
    openAuthGateModal('عرض الإشعارات');
    return;
  }

  const notifications = await api.getNotifications();

  mainContainer.innerHTML = `
    <div class="notifications-header">
      <div>
        <h1 style="font-size: 1.45rem; font-weight: 800;">مركز الإشعارات 🔔</h1>
        <p style="font-size: 0.88rem; color: var(--text-secondary);">تابع التفاعل مع Prompts والتحديثات الأخيرة</p>
      </div>
      
      <button class="btn btn-ghost btn-sm" id="mark-read-btn">
        تحديد الكل كمعروفي القراءة ✓
      </button>
    </div>

    <div id="notifications-list">
      ${notifications.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">🔔</div>
          <div class="empty-state-title">لا توجد إشعارات جديدة</div>
          <div class="empty-state-desc">ستظهر الإشعارات هنا عند تفاعل المجتمع مع أوامرك!</div>
        </div>
      ` : notifications.map(n => `
        <div class="notification-item ${!n.is_read ? 'unread' : ''}">
          <img src="${n.actor.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}" class="avatar avatar-md" alt="${n.actor.full_name}">
          <div class="notification-text">
            <span style="font-weight: 700; color: var(--text-primary);">${n.actor.full_name}</span>
            <span>${n.text}</span>
            <div class="notification-time">${timeAgo(n.time)}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  document.getElementById('mark-read-btn')?.addEventListener('click', async () => {
    await api.markNotificationsRead();
    store.setState({ unreadNotificationsCount: 0 });
    showToast('تم تحديد جميع الإشعارات كمقروءة ✓', '🔔', 'success');
    renderNotificationsView(mainContainer);
  });
}
