/* ==============================================================================
   🚀 PROMPT HUB - UNIFIED FRONTEND JAVASCRIPT (app.js)
   ==============================================================================
   هذا الملف مسؤول عن التحكم في تفاعلات الواجهة الأمامية وإرسال الطلبات إلى server.py:
   1. جلب وعرض الأوامر في Feed
   2. تنفيذ البحث الفوري (Live Search) عبر search_engine.py
   3. نسخ نص الـ Prompt فقط إظهار التنبيه
   4. الإعجاب بالأمر والتحديث المباشر في SQLite
   5. نشر أمر جديد من صفحة Studio والتوجيه للرئيسية
   6. تبديل الوضع الداكن والفاتح (Dark/Light Mode)
   ============================================================================== */

// 1. إدارة مظهر الشاشة (Dark / Light Mode)
function initTheme() {
  const savedTheme = localStorage.getItem('ph_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonText(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('ph_theme', newTheme);
  updateThemeButtonText(newTheme);
  showToast(`تم التبديل إلى الوضع ${newTheme === 'dark' ? 'الداكن 🌙' : 'الفاتح ☀️'}`);
}

function updateThemeButtonText(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '☀️ فاتح' : '🌙 داكن';
  }
}

// 2. إظهار التنبيهات المنبثقة (Toast Notifications)
function showToast(message, icon = '📋') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// 3. دالة نسخ prompt_text فقط بحجمها الدقيق
async function copyPromptText(text, btnElement) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    // إظهار التغذية البصرية على الزر والتنبيه
    if (btnElement) {
      const originalText = btnElement.innerHTML;
      btnElement.classList.add('copied');
      btnElement.innerHTML = '✅ تم النسخ!';

      setTimeout(() => {
        btnElement.classList.remove('copied');
        btnElement.innerHTML = originalText;
      }, 2000);
    }

    showToast('تم نسخ الأمر بنجاح 📋', '📋');
  } catch (err) {
    console.error('فشل النسخ:', err);
    showToast('حدث خطأ أثناء النسخ', '⚠️');
  }
}

// 4. دالة الإعجاب بالأمر والتحديث الفوري في SQLite عبر server.py
async function likePrompt(promptId, btnElement) {
  try {
    const response = await fetch('/api/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt_id: promptId })
    });
    
    const data = await response.json();
    if (data.success) {
      if (btnElement) {
        btnElement.classList.add('liked');
        const countSpan = btnElement.querySelector('.like-count');
        if (countSpan) countSpan.textContent = data.likes;
      }
      showToast('أضفت إعجابك بالـ Prompt ❤️', '❤️');
    }
  } catch (err) {
    console.error('فشل الإعجاب:', err);
  }
}

// 5. بناء بطاقة الـ Prompt لعرضها في الرئيسية الـ Feed
function createPromptCardHtml(prompt) {
  const firstLetter = prompt.author_name ? prompt.author_name.charAt(0) : 'أ';

  return `
    <article class="prompt-card">
      <div class="card-header">
        <div class="author-info">
          <div class="author-avatar">${firstLetter}</div>
          <div class="author-meta">
            <span class="author-name">${prompt.author_name}</span>
            <span class="author-spec">عضو مبدع</span>
          </div>
        </div>
        <span class="badge">${prompt.category || 'AI'}</span>
      </div>

      <h2 class="card-title">${prompt.title}</h2>
      <p class="card-desc">${prompt.description}</p>

      <div class="code-box">
        <div class="code-box-header">
          <span>🤖 AI PROMPT TEXT</span>
          <span>📋 جاهز للنسخ المباشر</span>
        </div>
        <div class="code-text">${escapeHtml(prompt.prompt_text)}</div>
      </div>

      <div class="card-actions">
        <div class="action-btn-group">
          <button class="action-btn btn-like" onclick="likePrompt(${prompt.id}, this)">
            <span>❤️</span>
            <span class="like-count">${prompt.likes}</span>
          </button>

          <a href="prompt.html?id=${prompt.id}" class="action-btn">
            <span>👁️ عرض الأمر</span>
          </a>
        </div>

        <button class="btn btn-sm btn-copy-main" onclick="copyPromptText(\`${escapeJsString(prompt.prompt_text)}\`, this)">
          📋 نسخ الأمر
        </button>
      </div>
    </article>
  `;
}

// 6. جلب الأوامر وعرضها في الصفحة الرئيسية Feed
async function loadFeedPrompts(category = 'all', searchQuery = '') {
  const container = document.getElementById('feed-container');
  if (!container) return;

  container.innerHTML = `<div style="text-align:center; padding:2rem;">جاري تحميل الأوامر... ⏳</div>`;

  try {
    let url = '/api/prompts';
    if (searchQuery && searchQuery.trim() !== '') {
      url = `/api/search?q=${encodeURIComponent(searchQuery.trim())}`;
    } else if (category && category !== 'all') {
      url = `/api/prompts?category=${encodeURIComponent(category)}`;
    }

    const res = await fetch(url);
    const prompts = await res.json();

    if (prompts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-title">لم نجد نتائج مطابقة للبحث</div>
          <div class="empty-desc">جرب البحث بكلمات أخرى مثل Python، تسويق، أو خطة مذاكرة</div>
        </div>
      `;
      return;
    }

    container.innerHTML = prompts.map(p => createPromptCardHtml(p)).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div class="empty-state"><div class="empty-title">حدث خطأ أثناء الاتصال بالخادم</div></div>`;
  }
}

// 7. تحميل تفاصيل الأمر في صفحة prompt.html
async function loadPromptDetails() {
  const container = document.getElementById('prompt-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const promptId = urlParams.get('id');

  if (!promptId) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const res = await fetch(`/api/prompt?id=${promptId}`);
    if (!res.ok) throw new Error('Not found');
    const prompt = await res.json();

    const firstLetter = prompt.author_name ? prompt.author_name.charAt(0) : 'أ';

    container.innerHTML = `
      <div style="margin-bottom: 1rem;">
        <a href="index.html" class="btn btn-secondary btn-sm">← العودة للرئيسية</a>
      </div>

      <div class="form-card">
        <div class="card-header" style="margin-bottom: 1.25rem;">
          <div class="author-info">
            <div class="author-avatar" style="width: 52px; height: 52px; font-size: 1.3rem;">${firstLetter}</div>
            <div class="author-meta">
              <span class="author-name" style="font-size: 1.15rem;">${prompt.author_name}</span>
              <span class="author-spec">عضو ناشر في Prompt Hub</span>
            </div>
          </div>
          <span class="badge" style="font-size: 0.9rem;">${prompt.category || 'AI'}</span>
        </div>

        <h1 style="font-size: 1.6rem; font-weight: 800; margin-bottom: 0.75rem;">${prompt.title}</h1>
        <p style="color: var(--text-secondary); font-size: 1rem; margin-bottom: 1.5rem;">${prompt.description}</p>

        <div class="code-box" style="padding: 1.25rem;">
          <div class="code-box-header" style="margin-bottom: 0.75rem;">
            <span>🤖 AI PROMPT TEXT</span>
            <span>📋 جاهز للنسخ والمشاركة</span>
          </div>
          <div class="code-text" style="font-size: 1rem; line-height: 1.7;">${escapeHtml(prompt.prompt_text)}</div>
        </div>

        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 1.5rem;">
          <button class="btn btn-primary btn-lg" onclick="copyPromptText(\`${escapeJsString(prompt.prompt_text)}\`, this)">
            📋 نسخ الأمر الأصلي
          </button>
          
          <button class="btn btn-secondary btn-lg btn-like" onclick="likePrompt(${prompt.id}, this)">
            ❤️ إعجاب (<span class="like-count">${prompt.likes}</span>)
          </button>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="empty-state"><div class="empty-title">لم يتم العثور على الـ Prompt المطلوب</div></div>`;
  }
}

// 8. معالجة نموذج نشر Prompt جديد في studio.html
function initStudioForm() {
  const form = document.getElementById('publish-prompt-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const author_name = document.getElementById('author-name').value.trim();
    const title = document.getElementById('prompt-title').value.trim();
    const category = document.getElementById('prompt-category').value;
    const description = document.getElementById('prompt-description').value.trim();
    const prompt_text = document.getElementById('prompt-text').value.trim();

    if (!author_name || !title || !description || !prompt_text) {
      showToast('يرجى ملء جميع الحقول المطلوبة ⚠️', '⚠️');
      return;
    }

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري النشر والحفظ في SQLite... ⏳';

    try {
      const res = await fetch('/api/add_prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name,
          title,
          category,
          description,
          prompt_text
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast('تم نشر الـ Prompt بنجاح 🚀', '🚀');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      } else {
        showToast(data.error || 'حدث خطأ أثناء الإضافة', '⚠️');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '🚀 نشر الأمر الآن';
      }
    } catch (err) {
      console.error(err);
      showToast('حدث خطأ في الاتصال بالخادم', '⚠️');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚀 نشر الأمر الآن';
    }
  });
}

// وظائف التشفير لمنع الأخطاء النصية
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

function escapeJsString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\')
            .replace(/`/g, '\\`')
            .replace(/\$/g, '\\$');
}

// تشغيل الوظائف عند فتح الصفحة
document.addEventListener('DOMContentLoaded', () => {
  initTheme();

  // فحص الصفحة الحالية لتشغيل الوظائف المناسبة
  if (document.getElementById('feed-container')) {
    loadFeedPrompts();

    // ربط شريط البحث
    const searchInput = document.getElementById('main-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          loadFeedPrompts('all', searchInput.value);
        }, 300);
      });
    }

    // ربط أزرار التصنيفات
    document.querySelectorAll('.category-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        loadFeedPrompts(cat);
      });
    });
  }

  if (document.getElementById('prompt-details-container')) {
    loadPromptDetails();
  }

  if (document.getElementById('publish-prompt-form')) {
    initStudioForm();
  }
});
