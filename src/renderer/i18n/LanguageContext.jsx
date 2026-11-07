import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { dictionaries } from '../locales/index.js';
import { setCurrentLanguage } from './translate.js';

const STORAGE_KEY = 'dnd_app_language';
const MODE_STORAGE_KEY = 'dnd_app_language_mode';

const LanguageContext = createContext(null);

function getSystemLanguage() {
  const sysLang = (
    (typeof navigator !== 'undefined' && (navigator.language || navigator.userLanguage)) ||
    'en'
  ).toLowerCase();

  // Strict fallback: only Russian turns the interface into Russian.
  // Every other system language (es, de, fr, zh, en, ...) falls back to English.
  return sysLang.startsWith('ru') ? 'ru' : 'en';
}

/**
 * Detect the initial application language.
 * 1. A previously saved manual choice wins.
 * 2. Otherwise Russian systems get Russian.
 * 3. Every other system language falls back to English.
 */
export function detectDefaultLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch (error) {
    // localStorage may be unavailable - fall through to system detection.
  }

  return getSystemLanguage();
}

function getInitialMode() {
  try {
    const savedMode = localStorage.getItem(MODE_STORAGE_KEY);
    if (savedMode === 'auto' || savedMode === 'ru' || savedMode === 'en') return savedMode;

    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage === 'ru' || savedLanguage === 'en') return savedLanguage;
  } catch (error) {
    // ignore storage errors
  }

  return 'auto';
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

export function LanguageProvider({ children }) {
  const [languageMode, setLanguageModeState] = useState(getInitialMode);
  const [systemLanguage, setSystemLanguage] = useState(getSystemLanguage);

  const language = languageMode === 'auto' ? systemLanguage : languageMode;

  // Keep the non-React translation helper in sync before children render.
  setCurrentLanguage(language);

  // React to OS language changes while the application is running.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleLanguageChange = () => setSystemLanguage(getSystemLanguage());
    window.addEventListener('languagechange', handleLanguageChange);
    return () => window.removeEventListener('languagechange', handleLanguageChange);
  }, []);

  const setLanguageMode = useCallback((nextMode) => {
    const normalized = nextMode === 'ru' || nextMode === 'en' ? nextMode : 'auto';
    setLanguageModeState(normalized);

    try {
      localStorage.setItem(MODE_STORAGE_KEY, normalized);
      if (normalized === 'auto') {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, normalized);
      }
    } catch (error) {
      // Storage is optional; the in-memory value still switches the UI.
    }
  }, []);

  // Keep the document language and window title in sync with the UI language.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language;
  }, [language]);

  const t = useCallback((key, variables) => {
    const dictionary = dictionaries[language] || dictionaries.en;
    let value = resolvePath(dictionary, key);

    if (value === undefined) {
      value = resolvePath(dictionaries.en, key);
    }
    if (value === undefined) {
      value = resolvePath(dictionaries.ru, key);
    }
    if (value === undefined) {
      return key;
    }
    if (typeof value === 'object' && value !== null) {
      return typeof value.title === 'string' ? value.title : key;
    }

    return interpolate(value, variables);
  }, [language]);

  const value = useMemo(() => ({
    language,
    languageMode,
    setLanguageMode,
    systemLanguage,
    t,
    getSystemLanguage
  }), [language, languageMode, setLanguageMode, systemLanguage, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used inside a LanguageProvider');
  }
  return context;
}

export { getSystemLanguage };
