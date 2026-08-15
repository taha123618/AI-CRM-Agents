import { TextDirection } from '../types/language.types';

export function applyDocumentLanguageAndDirection(code: string, direction: TextDirection) {
  if (typeof document === 'undefined') return;

  const html = document.documentElement;
  html.setAttribute('lang', code);
  html.setAttribute('dir', direction);

  if (direction === 'rtl') {
    html.classList.add('rtl-layout');
  } else {
    html.classList.remove('rtl-layout');
  }
}
