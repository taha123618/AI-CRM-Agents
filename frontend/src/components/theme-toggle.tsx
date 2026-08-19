import { useState, useRef, useEffect } from 'react';
import { Moon, Sun, Laptop, Check } from 'lucide-react';
import { useTheme } from '@/app/providers/theme-provider';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="fixed bottom-6 right-6 z-50 font-mono">
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute bottom-12 right-0 w-36 bg-[#121212] border border-[#3A4552] shadow-2xl p-1 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-[#3A4552]/60 mb-1 tracking-wider">
            Theme Mode
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('light');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left uppercase transition-colors cursor-pointer ${theme === 'light'
              ? 'bg-[#FFB800] text-[#0B0C10] font-bold'
              : 'text-slate-300 hover:bg-[#1C1C1C] hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 shrink-0" />
              <span>Light</span>
            </div>
            {theme === 'light' && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('dark');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left uppercase transition-colors cursor-pointer ${theme === 'dark'
              ? 'bg-[#FFB800] text-[#0B0C10] font-bold'
              : 'text-slate-300 hover:bg-[#1C1C1C] hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="w-3.5 h-3.5 shrink-0" />
              <span>Dark</span>
            </div>
            {theme === 'dark' && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setTheme('system');
              setIsOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left uppercase transition-colors cursor-pointer ${theme === 'system'
              ? 'bg-[#FFB800] text-[#0B0C10] font-bold'
              : 'text-slate-300 hover:bg-[#1C1C1C] hover:text-white'
              }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="w-3.5 h-3.5 shrink-0" />
              <span>System</span>
            </div>
            {theme === 'system' && <Check className="w-3.5 h-3.5 shrink-0" />}
          </button>
        </div>
      )}

      {/* Trigger Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Toggle application theme (Light, Dark, System)"
        className="relative h-11 w-11 p-0 rounded-none border border-[#3A4552] bg-[#121212] hover:bg-[#1C1C1C] text-slate-200 shadow-2xl hover:border-[#FFB800] focus:outline-none focus:border-[#FFB800] flex items-center justify-center cursor-pointer"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 text-[#FFB800]" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 text-[#FFB800]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}
