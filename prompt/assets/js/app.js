/* Prompt Hub - Main Application Entry Point & Router */
import { store } from './store.js';
import { initTheme } from './utils/theme.js';
import { renderSidebar, renderMobileHeader } from './components/navbar.js';
import { renderBottomNav } from './components/bottomNav.js';

import { renderFeedView } from './views/feedView.js';
import { renderExploreView } from './views/exploreView.js';
import { renderSearchView } from './views/searchView.js';
import { renderProfileView } from './views/profileView.js';
import { renderAuthView } from './views/authView.js';
import { renderNotificationsView } from './views/notificationsView.js';
import { renderSettingsView } from './views/settingsView.js';

class App {
  constructor() {
    this.mainContent = document.getElementById('main-content');
    this.rightPanel = document.getElementById('right-panel-container');
    this.init();
  }

  init() {
    // 1. Initialize Theme & Language
    initTheme();

    // 2. Initial Layout Render
    this.renderLayout();

    // 3. Subscribe to Central State Store Changes
    store.subscribe((state) => {
      this.renderLayout();
      this.renderCurrentView(state);
    });

    // 4. Initial Route Render
    this.renderCurrentView(store.getState());

    // 5. Handle Global Events (Theme change listener)
    window.addEventListener('themeChanged', () => {
      this.renderLayout();
    });
  }

  renderLayout() {
    renderSidebar();
    renderMobileHeader();
    renderBottomNav();
  }

  async renderCurrentView(state) {
    if (!this.mainContent) return;

    const view = state.currentView;

    // Toggle Desktop Right Panel visibility (only show on Feed view)
    if (this.rightPanel) {
      if (view === 'feed') {
        this.rightPanel.style.display = 'flex';
      } else {
        this.rightPanel.style.display = 'none';
      }
    }

    switch (view) {
      case 'feed':
        await renderFeedView(this.mainContent, this.rightPanel);
        break;

      case 'explore':
        await renderExploreView(this.mainContent);
        break;

      case 'search':
        await renderSearchView(this.mainContent);
        break;

      case 'profile':
        await renderProfileView(this.mainContent, { 
          profileUsername: state.profileUsername, 
          profileTab: state.profileTab 
        });
        break;

      case 'auth':
        renderAuthView(this.mainContent, { authMode: state.authMode || 'welcome' });
        break;

      case 'notifications':
        await renderNotificationsView(this.mainContent);
        break;

      case 'settings':
        renderSettingsView(this.mainContent);
        break;

      default:
        await renderFeedView(this.mainContent, this.rightPanel);
        break;
    }
  }
}

// Instantiate App when DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.appInstance = new App();
});
