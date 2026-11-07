import { dictionaries } from '../locales/index.js';

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem('dnd_app_language');
    if (saved === 'ru' || saved === 'en') return saved;
  } catch (error) {
    // ignore storage errors
  }

  const systemLanguage = (
    (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) ||
    'en'
  ).toLowerCase();

  return systemLanguage.startsWith('ru') ? 'ru' : 'en';
}

let currentLanguage = detectInitialLanguage();

export function setCurrentLanguage(language) {
  currentLanguage = language === 'en' ? 'en' : 'ru';
}

export function getCurrentLanguage() {
  return currentLanguage;
}

function resolvePath(dictionary, key) {
  return key.split('.').reduce((value, part) => {
    if (value === undefined || value === null) return undefined;
    return value[part];
  }, dictionary);
}

function interpolate(template, variables) {
  if (!variables) return template;

  return String(template).replace(/\{\{\s*(\w+)\s*\}\}|\{\s*(\w+)\s*\}/g, (match, doubleKey, singleKey) => {
    const key = doubleKey || singleKey;
    return Object.prototype.hasOwnProperty.call(variables, key) ? String(variables[key]) : match;
  });
}

/**
 * Translate a key outside of React components (data modules, canvas games, ...).
 * The active language is kept in sync by LanguageProvider.
 */
export function translate(key, variables, language = currentLanguage) {
  const dictionary = dictionaries[language] || dictionaries.en;
  let value = resolvePath(dictionary, key);

  if (value === undefined) value = resolvePath(dictionaries.en, key);
  if (value === undefined) value = resolvePath(dictionaries.ru, key);
  if (value === undefined) return key;
  if (typeof value === 'object' && value !== null) {
    return typeof value.title === 'string' ? value.title : key;
  }

  return interpolate(value, variables);
}
