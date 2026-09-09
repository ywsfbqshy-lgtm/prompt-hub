/* Prompt Hub - Settings & Preferences View Controller */
import { store } from '../store.js';
import { applyTheme, getCurrentTheme, applyLang, getCurrentLang } from '../utils/theme.js';
import { showToast } from '../components/toast.js';

export function renderSettingsView(mainContainer) {
  const currentTheme = getCurrentTheme();
  const currentLang = getCurrentLang();
  const state = store.getState();
  const currentUser = state.currentUser;

  mainContainer.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 0.35rem;">الإعدادات والتفضيلات ⚙️</h1>
      <p style="font-size: 0.9rem; color: var(--text-secondary);">خصص مظهر المنصة وإعدادات حسابك</p>
    </div>

    <!-- Appearance & Theme Section -->
    <div class="settings-section">
      <h2 class="settings-section-title">🎨 المظهر والنسق (Appearance)</h2>

      <div class="settings-row">
        <div class="settings-row-info">
          <span class="settings-row-title">وضع الشاشة (Theme)</span>
          <span class="settings-row-desc">اختر بين الوضع الداكن الداعم للراحة البصرية أو الوضع الفاتح</span>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-sm ${currentTheme === 'dark' ? 'btn-primary' : 'btn-secondary'}" data-set-theme="dark">🌙 داكن</button>
          <button class="btn btn-sm ${currentTheme === 'light' ? 'btn-primary' : 'btn-secondary'}" data-set-theme="light">☀️ فاتح</button>
          <button class="btn btn-sm ${currentTheme === 'system' ? 'btn-primary' : 'btn-secondary'}" data-set-theme="system">⚙️ النظام</button>
        </div>
      </div>

      <div class="settings-row">
        <div class="settings-row-info">
          <span class="settings-row-title">لغة الواجهة (Language)</span>
          <span class="settings-row-desc">يدعم Prompt Hub اتجاهات النص العربية RTL والإنجليزية LTR</span>
        </div>
        <div style="display: flex; gap: 0.4rem;">
          <button class="btn btn-sm ${currentLang === 'ar' ? 'btn-primary' : 'btn-secondary'}" data-set-lang="ar">العربية (RTL) 🇸🇦</button>
          <button class="btn btn-sm ${currentLang === 'en' ? 'btn-primary' : 'btn-secondary'}" data-set-lang="en">English (LTR) 🇬🇧</button>
        </div>
      </div>
    </div>

    <!-- Account Details Section -->
    ${currentUser ? `
      <div class="settings-section">
        <h2 class="settings-section-title">👤 إعدادات الحساب (Account Settings)</h2>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-row-title">البريد الإلكتروني</span>
            <span class="settings-row-desc">${currentUser.email} (متحقق منه ✓)</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="change-email-btn">تغيير</button>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-row-title">كلمة المرور</span>
            <span class="settings-row-desc">تم التحديث مؤخرًا</span>
          </div>
          <button class="btn btn-secondary btn-sm" id="change-pass-btn">تحديث</button>
        </div>

        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-row-title">تاريخ الميلاد</span>
            <span class="settings-row-desc">${currentUser.date_of_birth || '1998-05-14'}</span>
          </div>
          <span class="badge badge-other">محسوب تلقائيًا</span>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="settings-section" style="border-color: rgba(239, 68, 68, 0.3);">
        <h2 class="settings-section-title" style="color: var(--danger);">⚠️ المنطقة الخطرة (Danger Zone)</h2>
        <div class="settings-row">
          <div class="settings-row-info">
            <span class="settings-row-title">حذف الحساب نهائيًا</span>
            <span class="settings-row-desc">سيتم مسح جميع Prompts والمحفوظات الخاصة بك بشكل دائم</span>
          </div>
          <button class="btn btn-danger btn-sm" id="delete-account-btn">حذف الحساب 🗑️</button>
        </div>
      </div>
    ` : ''}
  `;

  // Theme Handlers
  mainContainer.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.setTheme;
      applyTheme(theme);
      showToast(`تم تغيير نمط الواجهة إلى ${theme} 🎨`, '🎨', 'success');
      renderSettingsView(mainContainer);
    });
  });

  // Language Handlers
  mainContainer.querySelectorAll('[data-set-lang]').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      applyLang(lang);
      showToast(`Language changed to ${lang === 'ar' ? 'العربية' : 'English'} 🌐`, '🌐', 'info');
      renderSettingsView(mainContainer);
    });
  });

  // Security Handlers
  document.getElementById('change-email-btn')?.addEventListener('click', () => {
    showToast('تم إرسال رابط تأكيد البريد الجديد 📧', '📧', 'info');
  });

  document.getElementById('change-pass-btn')?.addEventListener('click', () => {
    showToast('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك 🔑', '🔑', 'info');
  });

  document.getElementById('delete-account-btn')?.addEventListener('click', () => {
    if (confirm('هل أنت متأكد حقًا من رغبتك في حذف حسابك نهائيًا من Prompt Hub؟')) {
      store.logout();
      showToast('تم حذف الحساب بنجاح', 'ℹ️', 'info');
    }
  });
}
