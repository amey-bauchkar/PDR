import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pdr_theme_preview';

export default function ThemeToggle() {
  const [crimson, setCrimson] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'crimson';
  });

  useEffect(() => {
    document.body.classList.toggle('theme-crimson', crimson);
    localStorage.setItem(STORAGE_KEY, crimson ? 'crimson' : 'default');
  }, [crimson]);

  return (
    <button
      type="button"
      className="theme-toggle-fab"
      onClick={() => setCrimson((v) => !v)}
      aria-label={`Switch to ${crimson ? 'sky-blue' : 'crimson'} accent`}
      title={crimson ? 'Preview: Crimson accent — click to revert' : 'Preview: Crimson mockup'}
    >
      <span className="swatch swatch-current" />
      <span>→</span>
      <span className="swatch swatch-crimson" />
      <span>{crimson ? 'Crimson preview' : 'Try crimson'}</span>
    </button>
  );
}
