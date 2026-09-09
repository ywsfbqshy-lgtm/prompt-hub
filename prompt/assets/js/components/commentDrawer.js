/* Prompt Hub - Comment Drawer / Bottom Sheet Component */
import { api } from '../api.js';
import { store } from '../store.js';
import { timeAgo } from '../utils/helpers.js';
import { openAuthGateModal } from './authGateModal.js';
import { showToast } from './toast.js';

export function openCommentDrawer(promptId, onCommentAddedCallback) {
  const container = document.getElementById('drawer-container');
  if (!container) return;

  api.getPromptById(promptId).then(prompt => {
    renderDrawer(prompt);
  }).catch(err => {
    console.error(err);
  });

  function renderDrawer(prompt) {
    const state = store.getState();
    const currentUser = state.currentUser;
    const comments = prompt.comments || [];

    container.innerHTML = `
      <div class="drawer-overlay" id="comment-overlay">
        <div class="drawer-content animate-slide-up">
          <div class="modal-header" style="padding: 1rem 1.25rem;">
            <h3 class="modal-title">التعليقات 💬 (${comments.length})</h3>
            <button class="modal-close-btn" id="comment-close-btn">✕</button>
          </div>

          <!-- Comments Scroll Feed -->
          <div id="comments-list" style="flex: 1; overflow-y: auto; padding: 1rem 1.25rem;">
            ${comments.length === 0 ? `
              <div class="empty-state" style="border: none; padding: 2rem 1rem;">
                <div class="empty-state-icon">💬</div>
                <div class="empty-state-title">لا توجد تعليقات بعد</div>
                <div class="empty-state-desc">كن أول من يشارك رأيه أو تجريبه لهذا الـ Prompt!</div>
              </div>
            ` : comments.map(c => `
              <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem;">
                <img src="${c.author.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}" class="avatar avatar-sm" alt="${c.author.full_name}">
                <div style="flex: 1; background-color: var(--bg-secondary); padding: 0.75rem 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                    <span style="font-weight: 700; font-size: 0.88rem;">${c.author.full_name}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${timeAgo(c.created_at)}</span>
                  </div>
                  <div style="font-size: 0.88rem; color: var(--text-primary); line-height: 1.4;">${c.text}</div>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Comment Input Footer -->
          <div style="padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); background-color: var(--bg-card);">
            ${currentUser ? `
              <form id="add-comment-form" style="display: flex; gap: 0.5rem;">
                <input type="text" id="comment-input" class="form-input" placeholder="اكتب تعليقًا احترافيًا..." required style="border-radius: var(--radius-full);">
                <button type="submit" class="btn btn-primary" style="border-radius: var(--radius-full); padding: 0.65rem 1.1rem;">
                  إرسال
                </button>
              </form>
            ` : `
              <button id="comment-auth-gate-btn" class="btn btn-secondary btn-block">
                🔒 سجل الدخول لكتابة تعليق
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    const closeDrawer = () => container.innerHTML = '';

    document.getElementById('comment-close-btn')?.addEventListener('click', closeDrawer);
    document.getElementById('comment-overlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'comment-overlay') closeDrawer();
    });

    document.getElementById('comment-auth-gate-btn')?.addEventListener('click', () => {
      closeDrawer();
      openAuthGateModal('التعليق');
    });

    document.getElementById('add-comment-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('comment-input');
      const text = input.value.trim();
      if (!text) return;

      try {
        await api.addComment(promptId, text, currentUser);
        showToast('تمت إضافة التعليق بنجاح 🎉', '💬', 'success');
        input.value = '';
        const updatedPrompt = await api.getPromptById(promptId);
        renderDrawer(updatedPrompt);
        if (onCommentAddedCallback) onCommentAddedCallback(updatedPrompt.comments_count);
      } catch (err) {
        showToast('حدث خطأ أثناء إضافة التعليق', '⚠️', 'danger');
      }
    });
  }
}
