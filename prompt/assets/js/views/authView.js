/* Prompt Hub - Professional Authentication View Controller */
import { api } from '../api.js';
import { store } from '../store.js';
import { calculateAge, debounce } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export function renderAuthView(containerElement, options = {}) {
  const mode = options.authMode || 'welcome'; // welcome | login | register | verification | forgot

  if (mode === 'welcome') {
    renderWelcome(containerElement);
  } else if (mode === 'login') {
    renderLogin(containerElement);
  } else if (mode === 'register') {
    renderRegister(containerElement);
  } else if (mode === 'forgot') {
    renderForgotPassword(containerElement);
  } else if (mode === 'verification') {
    renderVerification(containerElement, options.email);
  }
}

// 1. Welcome Landing Screen
function renderWelcome(container) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-card text-center" style="max-width: 460px;">
        <div class="sidebar-logo" style="justify-content: center; margin-bottom: 1.25rem; font-size: 1.8rem;">
          <div class="logo-icon" style="width: 48px; height: 48px; font-size: 1.5rem;">🚀</div>
          <span>Prompt Hub</span>
        </div>

        <h1 class="auth-title">عالم جديد من Prompts الذكاء الاصطناعي</h1>
        <p class="auth-subtitle" style="margin-bottom: 1.75rem;">
          اكتشف وشارك وانسخ أفضل أوامر الذكاء الاصطناعي مع مجتمع رائد من المبدعين والطلاب.
        </p>

        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.5rem;">
          <!-- Google Auth Button Simulation -->
          <button id="google-auth-btn" class="btn btn-secondary btn-lg btn-block" style="background-color: var(--bg-hover); border-color: var(--border-color); color: var(--text-primary); font-weight: 600;">
            <span style="font-size: 1.2rem; margin-left: 0.5rem;">🔵</span> المتابعة باستخدام Google
          </button>

          <!-- Email Registration Button -->
          <button id="email-signup-btn" class="btn btn-primary btn-lg btn-block">
            📧 التسجيل باستخدام البريد الإلكتروني
          </button>
        </div>

        <div style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-secondary);">
          لديك حساب بالفعل؟ <a href="#" id="goto-login-link" style="color: var(--primary); font-weight: 700;">تسجيل الدخول</a>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1.25rem;">
          <button id="explore-guest-btn" class="btn btn-ghost btn-block" style="color: var(--text-muted); font-size: 0.9rem;">
            استكشف بدون حساب 🧭
          </button>
        </div>

        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 1.25rem; line-height: 1.4;">
          باستخدام Prompt Hub أنت توافق على <a href="#" style="text-decoration: underline;">شروط الاستخدام</a> و <a href="#" style="text-decoration: underline;">سياسة الخصوصية</a>.
        </div>
      </div>
    </div>
  `;

  document.getElementById('google-auth-btn')?.addEventListener('click', simulateGoogleAuth);
  document.getElementById('email-signup-btn')?.addEventListener('click', () => store.setCurrentView('auth', { authMode: 'register' }));
  document.getElementById('goto-login-link')?.addEventListener('click', (e) => { e.preventDefault(); store.setCurrentView('auth', { authMode: 'login' }); });
  document.getElementById('explore-guest-btn')?.addEventListener('click', () => store.setCurrentView('feed'));
}

// 2. Email Registration Form (with Date of Birth & Auto Age Calculation)
function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-card" style="max-width: 480px;">
        <div class="auth-header">
          <div class="auth-brand">🚀 Prompt Hub</div>
          <h2 class="auth-title">إنشاء حساب جديد 🚀</h2>
          <p class="auth-subtitle">انضم إلى أفضل مجتمع لأوامر الذكاء الاصطناعي</p>
        </div>

        <form id="signup-form">
          <div class="form-group">
            <label class="form-label">الاسم الكامل *</label>
            <input type="text" id="reg-fullname" class="form-input" placeholder="مثال: أحمد المتولي" required>
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label">اسم المستخدم (@username) *</label>
              <span id="username-status" style="font-size: 0.78rem; font-weight: 600;"></span>
            </div>
            <input type="text" id="reg-username" class="form-input" placeholder="ahmed_ai" required dir="ltr">
          </div>

          <div class="form-group">
            <label class="form-label">البريد الإلكتروني *</label>
            <input type="email" id="reg-email" class="form-input" placeholder="example@email.com" required dir="ltr">
          </div>

          <div class="form-group">
            <label class="form-label">كلمة المرور *</label>
            <input type="password" id="reg-password" class="form-input" placeholder="••••••••" required dir="ltr">
            <div class="password-strength-wrap">
              <div class="password-strength-bar" id="strength-bar">
                <div class="password-strength-segment seg-1"></div>
                <div class="password-strength-segment seg-2"></div>
                <div class="password-strength-segment seg-3"></div>
              </div>
              <div class="password-strength-label" id="strength-label">قوة كلمة المرور</div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">تأكيد كلمة المرور *</label>
            <input type="password" id="reg-confirm-password" class="form-input" placeholder="••••••••" required dir="ltr">
          </div>

          <!-- Date of Birth & Automatic Age Calculation -->
          <div class="form-group">
            <label class="form-label">تاريخ الميلاد * (يتم حساب العمر تلقائيًا)</label>
            <input type="date" id="reg-dob" class="form-input" required style="font-family: inherit;">
            <div id="age-calc-box" class="age-display-box hidden"></div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" id="reg-terms" required style="width: 16px; height: 16px; accent-color: var(--primary);">
              <span>أوافق على <a href="#" style="color: var(--primary); text-decoration: underline;">الشروط وسياسة الخصوصية</a></span>
            </label>
          </div>

          <button type="submit" id="submit-signup-btn" class="btn btn-primary btn-lg btn-block">
            🚀 إنشاء الحساب
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.25rem; font-size: 0.88rem; color: var(--text-secondary);">
          لديك حساب بالفعل؟ <a href="#" id="goto-login-from-reg" style="color: var(--primary); font-weight: 700;">تسجيل الدخول</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('goto-login-from-reg')?.addEventListener('click', (e) => { e.preventDefault(); store.setCurrentView('auth', { authMode: 'login' }); });

  // Live Username Availability Simulator
  const usernameInput = document.getElementById('reg-username');
  const usernameStatus = document.getElementById('username-status');

  usernameInput?.addEventListener('input', debounce(async () => {
    const val = usernameInput.value.trim();
    if (!val) { usernameStatus.textContent = ''; return; }
    const res = await api.checkUsernameAvailability(val);
    if (res.available) {
      usernameStatus.textContent = '✓ اسم المستخدم متاح';
      usernameStatus.style.color = 'var(--success)';
    } else {
      usernameStatus.textContent = '✕ مستخدم بالفعل';
      usernameStatus.style.color = 'var(--danger)';
    }
  }, 300));

  // Live Password Strength Meter
  const passwordInput = document.getElementById('reg-password');
  const strengthBar = document.getElementById('strength-bar');
  const strengthLabel = document.getElementById('strength-label');

  passwordInput?.addEventListener('input', () => {
    const pass = passwordInput.value;
    strengthBar.className = 'password-strength-bar';
    if (!pass) {
      strengthLabel.textContent = 'قوة كلمة المرور';
      return;
    }
    if (pass.length < 6) {
      strengthBar.classList.add('strength-weak');
      strengthLabel.textContent = 'ضعيفة 🔴';
      strengthLabel.style.color = 'var(--danger)';
    } else if (pass.length < 10) {
      strengthBar.classList.add('strength-medium');
      strengthLabel.textContent = 'متوسطة 🟡';
      strengthLabel.style.color = '#F59E0B';
    } else {
      strengthBar.classList.add('strength-strong');
      strengthLabel.textContent = 'قوية جدًا 🟢';
      strengthLabel.style.color = 'var(--success)';
    }
  });

  // Automatic Age Calculation Handler
  const dobInput = document.getElementById('reg-dob');
  const ageBox = document.getElementById('age-calc-box');
  let currentAgeEligibility = false;

  dobInput?.addEventListener('change', () => {
    const val = dobInput.value;
    const calc = calculateAge(val);
    ageBox.classList.remove('hidden');

    if (calc.isEligible) {
      ageBox.className = 'age-display-box';
      ageBox.innerHTML = `🎂 <span>${calc.message}</span>`;
      currentAgeEligibility = true;
    } else {
      ageBox.className = 'age-display-box age-warning-box';
      ageBox.innerHTML = `⚠️ <span>${calc.message}</span>`;
      currentAgeEligibility = false;
    }
  });

  // Submit Handler
  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pass = passwordInput.value;
    const confirmPass = document.getElementById('reg-confirm-password').value;

    if (pass !== confirmPass) {
      showToast('كلمتا المرور غير متطابقتين ❌', '⚠️', 'danger');
      return;
    }

    if (!dobInput.value || !currentAgeEligibility) {
      showToast('يرجى التأكد من استيفاء متطلبات العمر لإنشاء حساب', '⚠️', 'danger');
      return;
    }

    const userData = {
      full_name: document.getElementById('reg-fullname').value,
      username: usernameInput.value.trim(),
      email: document.getElementById('reg-email').value.trim(),
      date_of_birth: dobInput.value,
      auth_provider: 'email'
    };

    try {
      const user = await api.register(userData);
      store.setCurrentUser(user);
      renderWelcomeSuccess(container, user);
    } catch (err) {
      showToast('حدث خطأ أثناء إنشاء الحساب', '⚠️', 'danger');
    }
  });
}

// 3. Login Screen
function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-card" style="max-width: 440px;">
        <div class="auth-header">
          <div class="auth-brand">🚀 Prompt Hub</div>
          <h2 class="auth-title">مرحبًا بعودتك 👋</h2>
          <p class="auth-subtitle">سجل دخولك للاستمرار في عالم الـ Prompts</p>
        </div>

        <!-- Google OAuth Fast Login -->
        <button id="google-login-btn" class="btn btn-secondary btn-block" style="margin-bottom: 1.25rem; background-color: var(--bg-hover);">
          <span style="font-size: 1.1rem; margin-left: 0.4rem;">🔵</span> المتابعة باستخدام Google
        </button>

        <div class="auth-divider"><span>أو بالبريد الإلكتروني</span></div>

        <form id="login-form">
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني أو اسم المستخدم</label>
            <input type="text" id="login-email-user" class="form-input" placeholder="ahmed@example.com أو @ahmed_ai" required dir="ltr">
          </div>

          <div class="form-group">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label">كلمة المرور</label>
              <a href="#" id="goto-forgot-link" style="font-size: 0.8rem; color: var(--primary);">نسيت كلمة المرور؟</a>
            </div>
            <input type="password" id="login-password" class="form-input" placeholder="••••••••" required dir="ltr">
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--text-secondary); cursor: pointer;">
              <input type="checkbox" checked style="width: 16px; height: 16px; accent-color: var(--primary);">
              <span>تذكرني على هذا الجهاز</span>
            </label>
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block">
            تسجيل الدخول 🚀
          </button>
        </form>

        <div style="text-align: center; margin-top: 1.25rem; font-size: 0.88rem; color: var(--text-secondary);">
          ليس لديك حساب؟ <a href="#" id="goto-reg-from-login" style="color: var(--primary); font-weight: 700;">إنشاء حساب جديد</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('google-login-btn')?.addEventListener('click', simulateGoogleAuth);
  document.getElementById('goto-reg-from-login')?.addEventListener('click', (e) => { e.preventDefault(); store.setCurrentView('auth', { authMode: 'register' }); });
  document.getElementById('goto-forgot-link')?.addEventListener('click', (e) => { e.preventDefault(); store.setCurrentView('auth', { authMode: 'forgot' }); });

  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const inputVal = document.getElementById('login-email-user').value.trim();
    const pass = document.getElementById('login-password').value;

    try {
      const user = await api.login({ emailOrUsername: inputVal, password: pass });
      store.setCurrentUser(user);
      showToast(`مرحبًا بعودتك يا ${user.full_name} 👋`, '👋', 'success');
      store.setCurrentView('feed');
    } catch (err) {
      showToast(err.message || 'خطأ في بيانات الدخول', '⚠️', 'danger');
    }
  });
}

// 4. Forgot Password Screen
function renderForgotPassword(container) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-card" style="max-width: 420px;">
        <div class="auth-header">
          <div class="auth-brand">🚀 Prompt Hub</div>
          <h2 class="auth-title">استعادة كلمة المرور 🔑</h2>
          <p class="auth-subtitle">أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين</p>
        </div>

        <form id="forgot-form">
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني المسجل</label>
            <input type="email" id="forgot-email" class="form-input" placeholder="example@email.com" required dir="ltr">
          </div>

          <button type="submit" class="btn btn-primary btn-lg btn-block" style="margin-bottom: 1rem;">
            إرسال رابط الاستعادة 📧
          </button>
        </form>

        <div style="text-align: center; font-size: 0.88rem;">
          <a href="#" id="back-to-login" style="color: var(--text-secondary);">← العودة لتسجيل الدخول</a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('back-to-login')?.addEventListener('click', (e) => { e.preventDefault(); store.setCurrentView('auth', { authMode: 'login' }); });
  document.getElementById('forgot-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('forgot-email').value;
    showToast(`تم إرسال رابط اعادة التعيين إلى ${email} 📧`, '📧', 'info');
    setTimeout(() => store.setCurrentView('auth', { authMode: 'login' }), 2000);
  });
}

// 5. Simulated Google Auth Handler
async function simulateGoogleAuth() {
  showToast('جاري الاتصال بـ Google Auth... 🔵', '🔵', 'info');
  setTimeout(async () => {
    const googleUser = {
      full_name: 'سارة العلمي (Google)',
      username: 'sara_google_' + Math.floor(Math.random() * 1000),
      email: 'sara.google@example.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      date_of_birth: '2001-09-20',
      auth_provider: 'google'
    };

    const registered = await api.register(googleUser);
    store.setCurrentUser(registered);
    showToast('تم تسجيل الدخول بنجاح بواسطة Google 🔵', '✅', 'success');
    store.setCurrentView('feed');
  }, 600);
}

// Personalized Welcome Screen After Registration
function renderWelcomeSuccess(container, user) {
  container.innerHTML = `
    <div class="auth-page-wrapper">
      <div class="auth-card text-center animate-scale-in" style="max-width: 440px;">
        <div style="font-size: 4rem; margin-bottom: 0.75rem;">🎉</div>
        <h2 class="auth-title">أهلاً بك في Prompt Hub يا ${user.username}!</h2>
        <p class="auth-subtitle" style="margin-bottom: 1.75rem;">
          سعيدون بانضمامك إلى مجتمعنا. لنبدأ الآن باكتشاف أفضل وأقوى Prompts الذكاء الاصطناعي.
        </p>

        <button id="start-now-btn" class="btn btn-primary btn-lg btn-block">
          🚀 ابدأ الاستكشاف الآن
        </button>
      </div>
    </div>
  `;

  document.getElementById('start-now-btn')?.addEventListener('click', () => {
    store.setCurrentView('feed');
  });
}
