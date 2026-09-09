/* Prompt Hub - Helper Utilities */

/**
 * Calculates exact age based on Date of Birth string (YYYY-MM-DD)
 * @param {string} dobString - e.g. "2007-04-15"
 * @returns {object} { age: number, isEligible: boolean, message: string }
 */
export function calculateAge(dobString) {
  if (!dobString) return { age: 0, isEligible: false, message: 'الرجاء تحديد تاريخ الميلاد' };
  
  const birthDate = new Date(dobString);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { age: 0, isEligible: false, message: 'تاريخ الميلاد غير صالح' };
  }
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }
  
  const minAge = 13;
  const isEligible = age >= minAge;
  
  return {
    age,
    isEligible,
    message: isEligible 
      ? `العمر المحسوب: ${age} سنة`
      : `عذرًا، يجب أن تكون بعمر ${minAge} سنة على الأقل لإنشاء حساب.`
  };
}

/**
 * Formats large numbers into readable compact strings (e.g. 1420 -> 1.4K)
 * @param {number} num 
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Formats date into Arabic relative time (e.g. منذ ساعتين)
 * @param {string|Date} date 
 * @returns {string}
 */
export function timeAgo(date) {
  const now = new Date();
  const past = new Date(date);
  const elapsedMs = now - past;
  
  const seconds = Math.floor(elapsedMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'الآن';
  if (minutes === 1) return 'منذ دقيقة';
  if (minutes === 2) return 'منذ دقيقتين';
  if (minutes < 11) return `منذ ${minutes} دقائق`;
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  
  if (hours === 1) return 'منذ ساعة';
  if (hours === 2) return 'منذ ساعتين';
  if (hours < 11) return `منذ ${hours} ساعات`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  
  if (days === 1) return 'منذ يوم';
  if (days === 2) return 'منذ يومين';
  if (days < 11) return `منذ ${days} أيام`;
  return `منذ ${days} يوم`;
}

/**
 * Copies text safely to system clipboard
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

/**
 * Debounce helper function
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
