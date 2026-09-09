/* Prompt Hub - REST API Client Abstraction Layer */
import { INITIAL_PROMPTS, INITIAL_USERS, INITIAL_NOTIFICATIONS, INITIAL_CATEGORIES } from './db/initialData.js';

const STORAGE_KEYS = {
  PROMPTS: 'ph_prompts_db',
  USERS: 'ph_users_db',
  NOTIFICATIONS: 'ph_notifications_db',
  LIKED_PROMPTS: 'ph_liked_ids',
  SAVED_PROMPTS: 'ph_saved_ids',
  FOLLOWED_USERS: 'ph_followed_user_ids',
  CURRENT_USER: 'ph_current_user_session'
};

// Initialize Local Storage DB if empty
function initLocalStorageDB() {
  if (!localStorage.getItem(STORAGE_KEYS.PROMPTS)) {
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(INITIAL_PROMPTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LIKED_PROMPTS)) {
    localStorage.setItem(STORAGE_KEYS.LIKED_PROMPTS, JSON.stringify(['prompt_1']));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS)) {
    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(['prompt_2']));
  }
  if (!localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS)) {
    localStorage.setItem(STORAGE_KEYS.FOLLOWED_USERS, JSON.stringify(['user_2']));
  }
}

initLocalStorageDB();

// Helper to simulate realistic async REST network delay (100-250ms)
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Categories
  async getCategories() {
    await delay(50);
    return INITIAL_CATEGORIES;
  },

  // Get Feed / Prompts with Search, Filter & Sorting
  async getPrompts({ category = 'all', search = '', sort = 'trending', filter = 'all' } = {}) {
    await delay(120);
    let prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');
    const likedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED_PROMPTS) || '[]');
    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS) || '[]');
    const followedUserIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS) || '[]');

    // Category Filter
    if (category && category !== 'all') {
      if (category === 'trending') {
        prompts = prompts.filter(p => p.is_trending);
      } else {
        prompts = prompts.filter(p => (p.category_id && p.category_id.toLowerCase() === category.toLowerCase()) || 
                                       (p.category && p.category.toLowerCase() === category.toLowerCase()));
      }
    }

    // Search Query Filter
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      prompts = prompts.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.prompt_text.toLowerCase().includes(q) ||
        p.author.full_name.toLowerCase().includes(q) ||
        p.author.username.toLowerCase().includes(q) ||
        p.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    // Secondary Filter (Liked / Saved / Following)
    if (filter === 'liked') {
      prompts = prompts.filter(p => likedIds.includes(p.id));
    } else if (filter === 'saved') {
      prompts = prompts.filter(p => savedIds.includes(p.id));
    } else if (filter === 'following') {
      prompts = prompts.filter(p => followedUserIds.includes(p.author.id));
    }

    // Sort Order
    if (sort === 'trending') {
      prompts.sort((a, b) => (b.is_trending ? 1 : 0) - (a.is_trending ? 1 : 0) || b.likes_count - a.likes_count);
    } else if (sort === 'most_liked') {
      prompts.sort((a, b) => b.likes_count - a.likes_count);
    } else if (sort === 'most_copied') {
      prompts.sort((a, b) => b.copies_count - a.copies_count);
    } else if (sort === 'newest') {
      prompts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Map User Interactivity States
    return prompts.map(p => ({
      ...p,
      is_liked: likedIds.includes(p.id),
      is_saved: savedIds.includes(p.id),
      author: {
        ...p.author,
        is_following: followedUserIds.includes(p.author.id)
      }
    }));
  },

  // Get Single Prompt Details
  async getPromptById(id) {
    await delay(100);
    const prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');

    const likedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED_PROMPTS) || '[]');
    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS) || '[]');
    const followedUserIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS) || '[]');

    return {
      ...prompt,
      is_liked: likedIds.includes(prompt.id),
      is_saved: savedIds.includes(prompt.id),
      author: {
        ...prompt.author,
        is_following: followedUserIds.includes(prompt.author.id)
      }
    };
  },

  // Toggle Like Prompt
  async likePrompt(promptId) {
    await delay(80);
    let likedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKED_PROMPTS) || '[]');
    let prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');
    
    const promptIndex = prompts.findIndex(p => p.id === promptId);
    let isLiked = false;

    if (likedIds.includes(promptId)) {
      likedIds = likedIds.filter(id => id !== promptId);
      if (promptIndex !== -1 && prompts[promptIndex].likes_count > 0) {
        prompts[promptIndex].likes_count--;
      }
    } else {
      likedIds.push(promptId);
      isLiked = true;
      if (promptIndex !== -1) {
        prompts[promptIndex].likes_count++;
      }
    }

    localStorage.setItem(STORAGE_KEYS.LIKED_PROMPTS, JSON.stringify(likedIds));
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));

    return { is_liked: isLiked, likes_count: promptIndex !== -1 ? prompts[promptIndex].likes_count : 0 };
  },

  // Toggle Save Prompt
  async savePrompt(promptId) {
    await delay(80);
    let savedIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED_PROMPTS) || '[]');
    let isSaved = false;

    if (savedIds.includes(promptId)) {
      savedIds = savedIds.filter(id => id !== promptId);
    } else {
      savedIds.push(promptId);
      isSaved = true;
    }

    localStorage.setItem(STORAGE_KEYS.SAVED_PROMPTS, JSON.stringify(savedIds));
    return { is_saved: isSaved };
  },

  // Increment Copy Count
  async copyPrompt(promptId) {
    await delay(50);
    let prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');
    const promptIndex = prompts.findIndex(p => p.id === promptId);
    let copiesCount = 0;
    if (promptIndex !== -1) {
      prompts[promptIndex].copies_count = (prompts[promptIndex].copies_count || 0) + 1;
      copiesCount = prompts[promptIndex].copies_count;
      localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    }
    return { copies_count: copiesCount };
  },

  // Add Comment to Prompt
  async addComment(promptId, text, currentUser) {
    await delay(120);
    let prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');
    const promptIndex = prompts.findIndex(p => p.id === promptId);
    if (promptIndex === -1) throw new Error('Prompt not found');

    const newComment = {
      id: 'c_' + Date.now(),
      author: {
        full_name: currentUser.full_name,
        username: currentUser.username,
        avatar: currentUser.avatar
      },
      text: text,
      created_at: new Date().toISOString()
    };

    if (!prompts[promptIndex].comments) prompts[promptIndex].comments = [];
    prompts[promptIndex].comments.unshift(newComment);
    prompts[promptIndex].comments_count = prompts[promptIndex].comments.length;

    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    return newComment;
  },

  // Create New Prompt
  async createPrompt(promptData, currentUser) {
    await delay(200);
    let prompts = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROMPTS) || '[]');

    const newPrompt = {
      id: 'prompt_' + Date.now(),
      author: currentUser,
      title: promptData.title,
      description: promptData.description,
      prompt_text: promptData.prompt_text,
      category: promptData.category || 'AI',
      category_id: (promptData.category || 'ai').toLowerCase(),
      tags: promptData.tags || [],
      ai_model: promptData.ai_model || 'ChatGPT',
      difficulty: promptData.difficulty || 'Beginner',
      likes_count: 0,
      copies_count: 0,
      views_count: 1,
      comments_count: 0,
      comments: [],
      is_trending: false,
      created_at: new Date().toISOString()
    };

    prompts.unshift(newPrompt);
    localStorage.setItem(STORAGE_KEYS.PROMPTS, JSON.stringify(prompts));
    return newPrompt;
  },

  // Follow / Unfollow User
  async followUser(targetUserId) {
    await delay(80);
    let followedUserIds = JSON.parse(localStorage.getItem(STORAGE_KEYS.FOLLOWED_USERS) || '[]');
    let isFollowing = false;

    if (followedUserIds.includes(targetUserId)) {
      followedUserIds = followedUserIds.filter(id => id !== targetUserId);
    } else {
      followedUserIds.push(targetUserId);
      isFollowing = true;
    }

    localStorage.setItem(STORAGE_KEYS.FOLLOWED_USERS, JSON.stringify(followedUserIds));
    return { is_following: isFollowing };
  },

  // Check Username Availability
  async checkUsernameAvailability(username) {
    await delay(100);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const isTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    return { available: !isTaken };
  },

  // Authentication: Sign In
  async login({ emailOrUsername, password }) {
    await delay(200);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => 
      u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
      u.username.toLowerCase() === emailOrUsername.toLowerCase()
    );

    if (!user) {
      throw new Error('البريد الإلكتروني أو اسم المستخدم غير محدد');
    }

    // Store user session
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  // Authentication: Sign Up
  async register(userData) {
    await delay(250);
    let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

    const newUser = {
      id: 'user_' + Date.now(),
      full_name: userData.full_name,
      username: userData.username,
      email: userData.email,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      bio: userData.bio || 'مستخدم جديد في Prompt Hub 🚀',
      date_of_birth: userData.date_of_birth,
      auth_provider: userData.auth_provider || 'email',
      followers_count: 0,
      following_count: 0,
      prompts_count: 0,
      total_likes: 0,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return newUser;
  },

  // Get Current Session User
  getCurrentUser() {
    const session = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return session ? JSON.parse(session) : null;
  },

  // Logout
  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Get Notifications
  async getNotifications() {
    await delay(100);
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
  },

  // Mark all notifications read
  async markNotificationsRead() {
    await delay(50);
    let notifications = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    notifications = notifications.map(n => ({ ...n, is_read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    return notifications;
  }
};
