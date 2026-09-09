/* Prompt Hub - User Profile View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { renderPromptCard, attachPromptCardEvents } from '../components/promptCard.js';
import { openAuthGateModal } from '../components/authGateModal.js';
import { showToast } from '../components/toast.js';

export async function renderProfileView(mainContainer, options = {}) {
  const state = store.getState();
  const currentUser = state.currentUser;
  const targetUsername = options.profileUsername || (currentUser ? currentUser.username : null);

  if (!currentUser && !options.profileUsername) {
    openAuthGateModal('عرض الملف الشخصي');
    return;
  }

  let user = currentUser;
  if (targetUsername && currentUser && targetUsername !== currentUser.username) {
    // Fetch profile user
    const users = await api.getPrompts(); // Mock fetch
    user = {
      id: 'user_2',
      full_name: 'سارة العلمي',
      username: 'sara_code',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      bio: 'باحثة دكتوراة ومصممة واجهات UI/UX 🎨 أشارك أفضل أوامر ChatGPT وClaude للتصميم الأكاديمي.',
      followers_count: 2850,
      following_count: 420,
      prompts_count: 31
    };
  }

  const isOwnProfile = currentUser && currentUser.username === user.username;
  let activeTab = options.profileTab || 'prompts'; // prompts | liked | saved

  mainContainer.innerHTML = `
    <!-- Profile Header Card -->
    <div class="profile-header-card animate-fade-in">
      <div class="profile-banner"></div>

      <div class="profile-avatar-wrap">
        <img src="${user.avatar}" class="avatar avatar-xl" alt="${user.full_name}">
      </div>

      <h1 class="profile-fullname">${user.full_name}</h1>
      <div class="profile-username">@${user.username}</div>
      <p class="profile-bio">${user.bio || 'لا يوجد وصف شخصي بعد'}</p>

      <div style="margin-bottom: 1.25rem;">
        ${isOwnProfile ? `
          <button id="edit-profile-btn" class="btn btn-secondary btn-sm">
            ✏️ تعديل الملف الشخصي
          </button>
        ` : `
          <button class="btn btn-primary btn-sm">
            متابعة +
          </button>
        `}
      </div>

      <!-- Stats Row -->
      <div class="profile-stats-row">
        <div class="stat-item">
          <span class="stat-value">${user.prompts_count || 12}</span>
          <span class="stat-label">Prompts</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${user.followers_count || '1.2K'}</span>
          <span class="stat-label">متابعين</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">${user.following_count || 380}</span>
          <span class="stat-label">يتابع</span>
        </div>
      </div>
    </div>

    <!-- Profile Navigation Tabs -->
    <div class="profile-tabs">
      <div class="profile-tab ${activeTab === 'prompts' ? 'active' : ''}" data-tab="prompts">
        <span>▦ Prompts المنشورة</span>
      </div>
      <div class="profile-tab ${activeTab === 'liked' ? 'active' : ''}" data-tab="liked">
        <span>❤️ المعجب بها</span>
      </div>
      <div class="profile-tab ${activeTab === 'saved' ? 'active' : ''}" data-tab="saved">
        <span>🔖 المحفوظات</span>
      </div>
    </div>

    <!-- Prompts Tab Content List -->
    <div id="profile-prompts-list"></div>
  `;

  const listContainer = document.getElementById('profile-prompts-list');

  async function loadTabPrompts() {
    listContainer.innerHTML = `<div class="skeleton-card"><div class="skeleton skeleton-title"></div></div>`;
    
    let filterMode = 'all';
    if (activeTab === 'liked') filterMode = 'liked';
    else if (activeTab === 'saved') filterMode = 'saved';

    const prompts = await api.getPrompts({ filter: filterMode });

    if (prompts.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${activeTab === 'saved' ? '🔖' : activeTab === 'liked' ? '❤️' : '🤖'}</div>
          <div class="empty-state-title">
            ${activeTab === 'saved' ? 'لا توجد Prompts محفوظة بعد' : activeTab === 'liked' ? 'لم تعجب بأي Prompt بعد' : 'لم تقم بنشر أي Prompt بعد'}
          </div>
          <div class="empty-state-desc">
            ${activeTab === 'saved' ? 'ابدأ بحفظ الأوامر المميزة التي تعجبك أثناء التصفح لسهولة العودة إليها.' : 'استكشف المنصة وشارك إبداعاتك مع المجتمع!'}
          </div>
          <button class="btn btn-primary" id="profile-empty-action">
            استكشف Prompts 🚀
          </button>
        </div>
      `;

      document.getElementById('profile-empty-action')?.addEventListener('click', () => {
        store.setCurrentView('explore');
      });
      return;
    }

    listContainer.innerHTML = prompts.map(p => renderPromptCard(p)).join('');
    attachPromptCardEvents(listContainer);
  }

  mainContainer.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeTab = tab.dataset.tab;
      mainContainer.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadTabPrompts();
    });
  });

  document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
    openEditProfileModal(user);
  });

  loadTabPrompts();
}

// Edit Profile Modal Component
function openEditProfileModal(user) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-overlay" id="edit-profile-overlay">
      <div class="modal-card animate-scale-in" style="max-width: 480px;">
        <div class="modal-header">
          <h3 class="modal-title">تعديل الملف الشخصي ✏️</h3>
          <button class="modal-close-btn" id="edit-profile-close">✕</button>
        </div>

        <form id="edit-profile-form">
          <div class="form-group">
            <label class="form-label">الاسم الكامل</label>
            <input type="text" id="edit-name" class="form-input" value="${user.full_name}" required>
          </div>

          <div class="form-group">
            <label class="form-label">رابط الصورة الشخصية (Avatar)</label>
            <input type="text" id="edit-avatar" class="form-input" value="${user.avatar}" required dir="ltr">
          </div>

          <div class="form-group">
            <label class="form-label">النبذة الشخصية (Bio)</label>
            <textarea id="edit-bio" class="form-textarea" rows="3">${user.bio || ''}</textarea>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1.25rem;">
            <button type="button" class="btn btn-ghost" id="edit-cancel">إلغاء</button>
            <button type="submit" class="btn btn-primary">حفظ التغييرات</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => container.innerHTML = '';
  document.getElementById('edit-profile-close')?.addEventListener('click', closeModal);
  document.getElementById('edit-cancel')?.addEventListener('click', closeModal);

  document.getElementById('edit-profile-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      full_name: document.getElementById('edit-name').value,
      avatar: document.getElementById('edit-avatar').value,
      bio: document.getElementById('edit-bio').value
    };

    store.setCurrentUser(updatedUser);
    showToast('تم تحديث ملفك الشخصي بنجاح 🎉', '👤', 'success');
    closeModal();
    renderProfileView(document.getElementById('main-content'));
  });
}
