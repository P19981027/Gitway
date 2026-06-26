import { createContext, useContext, useState, useCallback } from 'react';
import ko from './ko.json';
import zh from './zh.json';
import en from './en.json';
import ja from './ja.json';

const translations = { ko, zh, en, ja };
const LANGUAGE_LABELS = { ko: '한국어', zh: '中文', en: 'English', ja: '日本語' };
const LANGUAGE_FLAGS = { ko: '🇰🇷', zh: '🇨🇳', en: '🇺🇸', ja: '🇯🇵' };

const I18nContext = createContext(null);

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ko');

  const changeLang = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      localStorage.setItem('lang', newLang);
    }
  }, []);

  const t = useCallback((key, vars) => {
    let value = getNestedValue(translations[lang], key) || getNestedValue(translations.ko, key) || key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return value;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, changeLang, t, languages: Object.keys(translations), labels: LANGUAGE_LABELS, flags: LANGUAGE_FLAGS }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export { LANGUAGE_LABELS, LANGUAGE_FLAGS };