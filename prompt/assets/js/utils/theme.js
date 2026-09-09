/* Prompt Hub - Theme & Language Management */

const THEME_KEY = 'prompthub_theme';
const LANG_KEY = 'prompthub_lang';

export function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
  const savedLang = localStorage.getItem(LANG_KEY) || 'ar';
  
  applyTheme(savedTheme);
  applyLang(savedLang);
}

export function applyTheme(theme) {
  let effectiveTheme = theme;
  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  
  document.documentElement.setAttribute('data-theme', effectiveTheme);
  localStorage.setItem(THEME_KEY, theme);
  
  // Dispatch custom theme change event
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme, effectiveTheme } }));
}

export function getCurrentTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

export function applyLang(lang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem(LANG_KEY, lang);
  
  // Dispatch custom lang change event
  window.dispatchEvent(new CustomEvent('langChanged', { detail: { lang, dir } }));
}

export function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || 'ar';
}
