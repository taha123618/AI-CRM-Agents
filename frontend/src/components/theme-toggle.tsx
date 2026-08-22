import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Laptop, Check } from 'lucide-react';
import { useTheme, type Theme } from '@/app/providers/theme-provider';

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ElementType;
}

const THEME_OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Laptop },
];

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const ActiveIcon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <div
      ref={dropdownRef}
      className="fixed bottom-6 right-6 z-50 font-mono"
      role="region"
      aria-label="Theme selector"
    >
      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute bottom-14 right-0 w-40 bg-card border border-border shadow-2xl p-1"
        >
          <div className="px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border mb-1">
            Theme Mode
          </div>

          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                type="button"
                role="menuitem"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={[
                  'w-full flex items-center justify-between px-2.5 py-2 text-xs uppercase font-mono font-bold cursor-pointer',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted hover:text-foreground',
                ].join(' ')}
              >
                <span className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {label}
                </span>
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Toggle theme"
        title={`Theme: ${theme}`}
        onClick={() => setIsOpen((v) => !v)}
        className={[
          'h-10 w-10 flex items-center justify-center',
          'bg-card border border-border text-foreground',
          'hover:border-primary hover:text-primary',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'shadow-xl cursor-pointer',
        ].join(' ')}
      >
        <ActiveIcon className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Toggle theme</span>
      </button>
    </div>
  );
}
