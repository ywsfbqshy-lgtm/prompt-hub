/* Prompt Hub - Share Modal Sheet Component */
import { copyToClipboard } from '../utils/helpers.js';
import { showToast } from './toast.js';

export function openShareModal(prompt) {
  const container = document.getElementById('modal-container');
  if (!container) return;

  const shareUrl = window.location.origin + window.location.pathname + `#prompt=${prompt.id}`;
  const shareText = `🚀 اكتشف هذا الـ Prompt الخرافي على Prompt Hub:\n\n"${prompt.title}"`;

  // Native Web Share API Check
  if (navigator.share) {
    navigator.share({
      title: prompt.title,
      text: shareText,
      url: shareUrl
    }).catch(() => {});
    return;
  }

  container.innerHTML = `
    <div class="modal-overlay" id="share-overlay">
      <div class="modal-card" style="max-width: 420px;">
        <div class="modal-header">
          <h3 class="modal-title">مشاركة الـ Prompt 📤</h3>
          <button class="modal-close-btn" id="share-close-btn">✕</button>
        </div>

        <div style="margin-bottom: 1.25rem; font-weight: 600; font-size: 0.95rem; color: var(--text-primary);">
          ${prompt.title}
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem;">
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}" 
             target="_blank" class="btn btn-secondary" style="color: #25D366; background: rgba(37,211,102,0.1); border-color: rgba(37,211,102,0.2);">
             📱 WhatsApp
          </a>
          <a href="https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}" 
             target="_blank" class="btn btn-secondary" style="color: #0088cc; background: rgba(0,136,204,0.1); border-color: rgba(0,136,204,0.2);">
             ✈️ Telegram
          </a>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label class="form-label">رابط المشاركة المباشر</label>
          <div style="display: flex; gap: 0.5rem;">
            <input type="text" class="form-input" value="${shareUrl}" readonly id="share-url-input">
            <button class="btn btn-primary" id="copy-share-url-btn">
              📋 نسخ
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const closeModal = () => container.innerHTML = '';

  document.getElementById('share-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('share-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'share-overlay') closeModal();
  });

  document.getElementById('copy-share-url-btn')?.addEventListener('click', async () => {
    const success = await copyToClipboard(shareUrl);
    if (success) {
      showToast('تم نسخ رابط الـ Prompt بنجاح 🔗', '📋', 'success');
      closeModal();
    }
  });
}
