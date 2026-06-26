import { useState, useRef, useEffect } from 'react';
import { useI18n } from '../i18n';

export default function LanguageSwitcher() {
  const { lang, changeLang, labels, flags } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground-700 hover:bg-foreground-900/5 transition-colors">
        <span className="text-base">{flags[lang]}</span>
        <span className="hidden sm:inline">{labels[lang]}</span>
        <i className="ri-arrow-down-s-line text-xs"></i>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 rounded-xl bg-white shadow-lg border border-background-200/60 py-1.5 z-50">
          {Object.entries(labels).map(([code, label]) => (
            <button key={code} onClick={() => { changeLang(code); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 text-sm transition-colors ${lang === code ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-foreground-700 hover:bg-background-50'}`}>
              <span className="text-base">{flags[code]}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}