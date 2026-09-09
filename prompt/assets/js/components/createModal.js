/* Prompt Hub - Create Prompt Modal Component with Live Preview */
import { api } from '../api.js';
import { store } from '../store.js';
import { openAuthGateModal } from './authGateModal.js';
import { showToast } from './toast.js';

export function openCreatePromptModal(onPublishedCallback) {
  const state = store.getState();
  if (!state.currentUser) {
    openAuthGateModal('إنشاء ونشر Prompt جديد');
    return;
  }

  const container = document.getElementById('modal-container');
  if (!container) return;

  container.innerHTML = `
    <div class="modal-overlay" id="create-modal-overlay">
      <div class="modal-card animate-scale-in" style="max-width: 620px;">
        <div class="modal-header">
          <h3 class="modal-title">إنشاء Prompt جديد 🚀</h3>
          <div style="display: flex; gap: 0.5rem;">
            <button id="tab-edit-btn" class="btn btn-sm btn-primary">المحرر ✏️</button>
            <button id="tab-preview-btn" class="btn btn-sm btn-secondary">معاينة 👁️</button>
            <button class="modal-close-btn" id="create-close-btn">✕</button>
          </div>
        </div>

        <!-- Editor Form View -->
        <form id="create-prompt-form">
          <div id="editor-tab-content">
            <div class="form-group">
              <label class="form-label">عنوان الـ Prompt *</label>
              <input type="text" id="prompt-title" class="form-input" placeholder="مثال: أمر كاشف ومصلح الثغرات البرمجية في كود Python" required>
            </div>

            <div class="form-group">
              <label class="form-label">الوصف الموجز *</label>
              <input type="text" id="prompt-desc" class="form-input" placeholder="شرح مختصر لكيفية فائدة هذا الـ Prompt والمخرجات المتوقعة..." required>
            </div>

            <div class="form-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="form-label">نص الـ Prompt الأصلي *</label>
                <div style="font-size: 0.75rem; color: var(--text-muted);">
                  <span id="char-count">0</span> حرف | <span id="word-count">0</span> كلمة
                </div>
              </div>
              <textarea id="prompt-text" class="form-textarea" rows="6" placeholder="اكتب أمر الذكاء الاصطناعي الخاص بك هنا بأقصى دقة ووضوح..." required style="font-family: var(--font-mono); font-size: 0.9rem;"></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label class="form-label">التصنيف الرئيسي *</label>
                <select id="prompt-category" class="form-select">
                  <option value="Programming">💻 البرمجة</option>
                  <option value="Education">📚 التعليم والطلاب</option>
                  <option value="Marketing">📈 التسويق والأعمال</option>
                  <option value="Design">🎨 التصميم والواجهات</option>
                  <option value="Writing">✍️ الكتابة والمحتوى</option>
                  <option value="AI">🤖 الذكاء الاصطناعي</option>
                  <option value="Research">🔬 البحوث والتحليل</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">نموذج AI المستهدف *</label>
                <select id="prompt-model" class="form-select">
                  <option value="ChatGPT">ChatGPT (OpenAI)</option>
                  <option value="Claude">Claude (Anthropic)</option>
                  <option value="Gemini">Gemini (Google)</option>
                  <option value="Midjourney">Midjourney</option>
                  <option value="DeepSeek">DeepSeek AI</option>
                  <option value="Other">نموذج آخر</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label class="form-label">مستوى الصعوبة</label>
                <select id="prompt-difficulty" class="form-select">
                  <option value="Beginner">مبتدئ (Beginner)</option>
                  <option value="Intermediate">متوسط (Intermediate)</option>
                  <option value="Advanced">متقدم (Advanced)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">الوسوم (Tags)</label>
                <input type="text" id="prompt-tags" class="form-input" placeholder="#Python #ChatGPT #جامعة">
              </div>
            </div>
          </div>

          <!-- Preview Tab Content -->
          <div id="preview-tab-content" class="hidden" style="margin-bottom: 1.25rem;">
            <div style="padding: 0.5rem; background: var(--bg-secondary); border-radius: var(--radius-md); font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem; text-align: center;">
              👁️ هذه معاينة مباشرة لكيفية ظهور الـ Prompt للمستخدمين قبل النشر
            </div>
            <div id="live-preview-card-holder"></div>
          </div>

          <div style="display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <button type="button" class="btn btn-ghost" id="create-cancel-btn">إلغاء</button>
            <button type="submit" class="btn btn-primary btn-lg" id="publish-submit-btn">
              🚀 نشر الـ Prompt الآن
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  const closeModal = () => container.innerHTML = '';
  document.getElementById('create-close-btn')?.addEventListener('click', closeModal);
  document.getElementById('create-cancel-btn')?.addEventListener('click', closeModal);
  document.getElementById('create-modal-overlay')?.addEventListener('click', (e) => {
    if (e.target.id === 'create-modal-overlay') closeModal();
  });

  // Counters Handler
  const promptTextarea = document.getElementById('prompt-text');
  const charCount = document.getElementById('char-count');
  const wordCount = document.getElementById('word-count');

  promptTextarea?.addEventListener('input', () => {
    const val = promptTextarea.value;
    charCount.textContent = val.length;
    wordCount.textContent = val.trim() ? val.trim().split(/\s+/).length : 0;
  });

  // Tab Toggle Handlers
  const editorTab = document.getElementById('editor-tab-content');
  const previewTab = document.getElementById('preview-tab-content');
  const tabEditBtn = document.getElementById('tab-edit-btn');
  const tabPreviewBtn = document.getElementById('tab-preview-btn');

  tabEditBtn?.addEventListener('click', () => {
    editorTab.classList.remove('hidden');
    previewTab.classList.add('hidden');
    tabEditBtn.className = 'btn btn-sm btn-primary';
    tabPreviewBtn.className = 'btn btn-sm btn-secondary';
  });

  tabPreviewBtn?.addEventListener('click', () => {
    editorTab.classList.add('hidden');
    previewTab.classList.remove('hidden');
    tabPreviewBtn.className = 'btn btn-sm btn-primary';
    tabEditBtn.className = 'btn btn-sm btn-secondary';
    updateLivePreview();
  });

  function updateLivePreview() {
    const title = document.getElementById('prompt-title').value || 'عنوان الـ Prompt هنا...';
    const desc = document.getElementById('prompt-desc').value || 'وصف مختصر سيظهر للمستخدمين هنا...';
    const text = document.getElementById('prompt-text').value || 'نص الـ Prompt الأصلي سيظهر هنا في هذا المربع المخصص...';
    const model = document.getElementById('prompt-model').value;
    const diff = document.getElementById('prompt-difficulty').value;
    const currentUser = state.currentUser;

    document.getElementById('live-preview-card-holder').innerHTML = `
      <div class="prompt-card">
        <div class="prompt-card-header">
          <div class="creator-info">
            <img src="${currentUser.avatar}" class="avatar avatar-sm" alt="${currentUser.full_name}">
            <div class="creator-meta">
              <span class="creator-name">${currentUser.full_name}</span>
              <span class="creator-username">@${currentUser.username}</span>
            </div>
          </div>
          <span class="badge badge-${diff.toLowerCase()}">${diff}</span>
        </div>
        <div class="prompt-title">${title}</div>
        <div class="prompt-description">${desc}</div>
        <div class="prompt-code-box">
          <div class="prompt-code-header">
            <span>🤖 Model: ${model}</span>
            <span>📋 PROMPT TEXT</span>
          </div>
          <div class="prompt-code-text expanded">${text}</div>
        </div>
      </div>
    `;
  }

  // Form Submit Handler
  document.getElementById('create-prompt-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('publish-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري النشر... ⏳';

    const tagsInput = document.getElementById('prompt-tags').value;
    const tagsArr = tagsInput.split(/\s+/).filter(t => t.startsWith('#') || t.length > 0).map(t => t.startsWith('#') ? t : '#' + t);

    const newPromptData = {
      title: document.getElementById('prompt-title').value,
      description: document.getElementById('prompt-desc').value,
      prompt_text: document.getElementById('prompt-text').value,
      category: document.getElementById('prompt-category').value,
      ai_model: document.getElementById('prompt-model').value,
      difficulty: document.getElementById('prompt-difficulty').value,
      tags: tagsArr
    };

    try {
      const created = await api.createPrompt(newPromptData, state.currentUser);
      showToast('تم نشر الـ Prompt بنجاح 🎉', '🚀', 'success');
      closeModal();
      if (onPublishedCallback) onPublishedCallback(created);
      store.setCurrentView('feed');
    } catch (err) {
      showToast('حدث خطأ أثناء النشر', '⚠️', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '🚀 نشر الـ Prompt الآن';
    }
  });
}
