/* Prompt Hub - Centralized Reactive State Store */
import { api } from './api.js';

class StateStore {
  constructor() {
    this.state = {
      currentUser: api.getCurrentUser(),
      currentView: 'feed', // feed | explore | search | profile | notifications | settings | auth
      selectedCategory: 'all',
      searchQuery: '',
      sortOption: 'trending',
      profileUsername: null,
      unreadNotificationsCount: 2
    };

    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  setCurrentView(view, payload = {}) {
    this.setState({
      currentView: view,
      ...payload
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setCategory(category) {
    this.setState({ selectedCategory: category, currentView: 'feed' });
  }

  setSearchQuery(query) {
    this.setState({ searchQuery: query });
  }

  setCurrentUser(user) {
    this.setState({ currentUser: user });
  }

  logout() {
    api.logout();
    this.setState({ currentUser: null, currentView: 'feed' });
  }
}

export const store = new StateStore();
