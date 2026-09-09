/* Prompt Hub - Instagram-style Prompt Card Component */
import { api } from '../api.js';
import { store } from '../store.js';
import { timeAgo, formatNumber, copyToClipboard } from '../utils/helpers.js';
import { showToast } from './toast.js';
import { openAuthGateModal } from './authGateModal.js';
import { openShareModal } from './shareModal.js';
import { openCommentDrawer } from './commentDrawer.js';

export function renderPromptCard(prompt) {
  const state = store.getState();
  const currentUser = state.currentUser;
  
  const isAuthor = currentUser && currentUser.id === prompt.author.id;
  const isFollowing = prompt.author.is_following;

  const modelBadgeClass = `badge-${(prompt.ai_model || 'other').toLowerCase()}`;
  const diffBadgeClass = `badge-${(prompt.difficulty || 'beginner').toLowerCase()}`;

  const cardHtml = `
    <article class="prompt-card animate-fade-in" data-id="${prompt.id}">
      <!-- Creator Header -->
      <div class="prompt-card-header">
        <div class="creator-info" style="cursor: pointer;" data-action="view-profile" data-username="${prompt.author.username}">
          <img src="${prompt.author.avatar}" class="avatar avatar-md" alt="${prompt.author.full_name}">
          <div class="creator-meta">
            <span class="creator-name">
              ${prompt.author.full_name}
            </span>
            <span class="creator-username">@${prompt.author.username} • ${timeAgo(prompt.created_at)}</span>
          </div>
        </div>
        
        ${!isAuthor ? `
          <button class="btn btn-sm ${isFollowing ? 'btn-secondary' : 'btn-outline'}" data-action="toggle-follow" data-userid="${prompt.author.id}">
            ${isFollowing ? 'تتابعه ✓' : 'متابعة +'}
          </button>
        ` : `
          <span class="badge badge-other">منشوراتك</span>
        `}
      </div>

      <!-- Title & Description -->
      <h2 class="prompt-title">${prompt.title}</h2>
      <p class="prompt-description">${prompt.description}</p>

      <!-- Category, Tags & AI Badges -->
      <div class="prompt-tags-container">
        <span class="badge ${modelBadgeClass}">🤖 ${prompt.ai_model || 'ChatGPT'}</span>
        <span class="badge ${diffBadgeClass}">${prompt.difficulty || 'Beginner'}</span>
        ${(prompt.tags || []).map(tag => `<span class="tag-item">${tag}</span>`).join(' ')}
      </div>

      <!-- Prompt Code Box (Formatted Copy Target) -->
      <div class="prompt-code-box">
        <div class="prompt-code-header">
          <span>🤖 AI PROMPT TEXT</span>
          <span>📋 جاهز للنسخ المباشر</span>
        </div>
        <div class="prompt-code-text" id="code-text-${prompt.id}">${escapeHtml(prompt.prompt_text)}</div>
        ${prompt.prompt_text.length > 200 ? `
          <div class="show-more-btn" data-action="toggle-expand" data-id="${prompt.id}">
            عرض الـ Prompt كاملاً 👇
          </div>
        ` : ''}
      </div>

      <!-- Actions Bar -->
      <div class="post-actions-bar">
        <div class="action-btn-group">
          <!-- Like Button -->
          <button class="action-icon-btn ${prompt.is_liked ? 'liked' : ''}" data-action="like" data-id="${prompt.id}">
            <span class="heart-icon ${prompt.is_liked ? 'heart-pop' : ''}">${prompt.is_liked ? '❤️' : '🤍'}</span>
            <span class="like-count">${formatNumber(prompt.likes_count)}</span>
          </button>

          <!-- Comment Button -->
          <button class="action-icon-btn" data-action="comment" data-id="${prompt.id}">
            <span>💬</span>
            <span class="comment-count">${formatNumber(prompt.comments_count)}</span>
          </button>

          <!-- Save Button -->
          <button class="action-icon-btn ${prompt.is_saved ? 'saved' : ''}" data-action="save" data-id="${prompt.id}">
            <span>${prompt.is_saved ? '🔖' : '🏷️'}</span>
          </button>

          <!-- Share Button -->
          <button class="action-icon-btn" data-action="share" data-id="${prompt.id}">
            <span>📤</span>
          </button>
        </div>

        <!-- Prominent Copy Button -->
        <button class="btn btn-sm copy-main-btn" data-action="copy-prompt" data-id="${prompt.id}">
          <span class="copy-icon">📋</span>
          <span class="copy-text">نسخ الـ Prompt</span>
          <span style="font-size: 0.75rem; opacity: 0.8; margin-right: 0.2rem;">(${formatNumber(prompt.copies_count)})</span>
        </button>
      </div>
    </article>
  `;

  return cardHtml;
}

// Global Event Delegation Helper for Prompt Cards
export function attachPromptCardEvents(containerElement) {
  if (!containerElement) return;

  containerElement.addEventListener('click', async (e) => {
    const targetBtn = e.target.closest('[data-action]');
    if (!targetBtn) return;

    const action = targetBtn.dataset.action;
    const promptId = targetBtn.dataset.id;
    const state = store.getState();
    const currentUser = state.currentUser;

    // View Profile
    if (action === 'view-profile') {
      const username = targetBtn.dataset.username;
      store.setCurrentView('profile', { profileUsername: username });
      return;
    }

    // Toggle Code Expand
    if (action === 'toggle-expand') {
      const textElem = document.getElementById(`code-text-${promptId}`);
      if (textElem) {
        const isExpanded = textElem.classList.toggle('expanded');
        targetBtn.textContent = isExpanded ? 'إخفاء الأسطر 👆' : 'عرض الـ Prompt كاملاً 👇';
      }
      return;
    }

    // Interactive Action Gates
    if (!currentUser && ['like', 'save', 'toggle-follow'].includes(action)) {
      openAuthGateModal(action === 'like' ? 'الإعجاب' : action === 'save' ? 'الحفظ' : 'المتابعة');
      return;
    }

    // Like Action
    if (action === 'like') {
      try {
        const result = await api.likePrompt(promptId);
        const countElem = targetBtn.querySelector('.like-count');
        const iconElem = targetBtn.querySelector('.heart-icon');
        
        if (result.is_liked) {
          targetBtn.classList.add('liked');
          iconElem.textContent = '❤️';
          iconElem.classList.add('heart-pop');
          showToast('أضفت إعجابك بالـ Prompt ❤️', '❤️', 'success');
        } else {
          targetBtn.classList.remove('liked');
          iconElem.textContent = '🤍';
          iconElem.classList.remove('heart-pop');
        }
        if (countElem) countElem.textContent = formatNumber(result.likes_count);
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Save Action
    if (action === 'save') {
      try {
        const result = await api.savePrompt(promptId);
        if (result.is_saved) {
          targetBtn.classList.add('saved');
          targetBtn.querySelector('span').textContent = '🔖';
          showToast('تم حفظ الـ Prompt في محفوظاتك 🔖', '🔖', 'success');
        } else {
          targetBtn.classList.remove('saved');
          targetBtn.querySelector('span').textContent = '🏷️';
          showToast('تمت إزالة الـ Prompt من المحفوظات', 'ℹ️', 'info');
        }
      } catch (err) {
        console.error(err);
      }
      return;
    }

    // Copy Prompt Action (CRITICAL REQUIREMENT: strictly copy prompt_text)
    if (action === 'copy-prompt') {
      const promptData = await api.getPromptById(promptId);
      if (promptData && promptData.prompt_text) {
        const success = await copyToClipboard(promptData.prompt_text);
        if (success) {
          // Increment copy count in DB
          const result = await api.copyPrompt(promptId);
          
          // Visual Feedback on Button
          targetBtn.classList.add('copied');
          const copyTextElem = targetBtn.querySelector('.copy-text');
          const copyIconElem = targetBtn.querySelector('.copy-icon');
          if (copyTextElem) copyTextElem.textContent = 'تم النسخ!';
          if (copyIconElem) copyIconElem.textContent = '✅';

          showToast('تم نسخ الـ Prompt إلى الحافظة بنجاح 📋', '📋', 'success');

          setTimeout(() => {
            targetBtn.classList.remove('copied');
            if (copyTextElem) copyTextElem.textContent = 'نسخ الـ Prompt';
            if (copyIconElem) copyIconElem.textContent = '📋';
          }, 2000);
        }
      }
      return;
    }

    // Share Action
    if (action === 'share') {
      const promptData = await api.getPromptById(promptId);
      openShareModal(promptData);
      return;
    }

    // Comment Action
    if (action === 'comment') {
      openCommentDrawer(promptId, (newCount) => {
        const commentCountElem = targetBtn.querySelector('.comment-count');
        if (commentCountElem) commentCountElem.textContent = formatNumber(newCount);
      });
      return;
    }

    // Follow User Action
    if (action === 'toggle-follow') {
      const userId = targetBtn.dataset.userid;
      const res = await api.followUser(userId);
      if (res.is_following) {
        targetBtn.className = 'btn btn-sm btn-secondary';
        targetBtn.textContent = 'تتابعه ✓';
        showToast('بدأت بمتابعة المستخدم 👥', '👤', 'success');
      } else {
        targetBtn.className = 'btn btn-sm btn-outline';
        targetBtn.textContent = 'متابعة +';
      }
    }
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}
