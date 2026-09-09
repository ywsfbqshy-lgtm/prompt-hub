/* Prompt Hub - Auth Gate Modal for Unauthenticated Users */
import { store } from '../store.js';

export function openAuthGateModal(actionName = 'المتابعة') {
  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-overlay" id="auth-gate-overlay">
      <div class="modal-card text-center" style="max-width: 380px;">
        <div style="font-size: 3.5rem; margin-bottom: 0.75rem;">🚀</div>
        <h3 class="modal-title" style="margin-bottom: 0.5rem; font-size: 1.3rem;">أنشئ حسابك أولاً</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.5rem; line-height: 1.5;">
          سجّل مجانًا لـ ${actionName} والتفاعل مع أفضل مجتمع لـ AI Prompts في العالم العربي.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
          <button id="auth-gate-register-btn" class="btn btn-primary btn-block btn-lg">
            إنشاء حساب جديد 🚀
          </button>
          <button id="auth-gate-login-btn" class="btn btn-secondary btn-block btn-lg">
            تسجيل الدخول
          </button>
        </div>

        <button id="auth-gate-close-btn" class="btn btn-ghost btn-block btn-sm" style="color: var(--text-muted);">
          إغلاق والاستمرار كزائر
        </button>
      </div>
    </div>
  `;

  // Attach Event Handlers
  document.getElementById('auth-gate-register-btn')?.addEventListener('click', () => {
    closeModal();
    store.setCurrentView('auth', { authMode: 'register' });
  });

  document.getElementById('auth-gate-login-btn')?.addEventListener('click', () => {
    closeModal();
    store.setCurrentView('auth', { authMode: 'login' });
  });

  document.getElementById('auth-gate-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('auth-gate-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-gate-overlay') closeModal();
  });

  function closeModal() {
    container.innerHTML = '';
  }
}
