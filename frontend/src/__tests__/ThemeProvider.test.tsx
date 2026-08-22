import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '@/app/providers/theme-provider';
import { ThemeToggle } from '@/components/theme-toggle';

function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  );
}

describe('ThemeProvider & ThemeToggle Suite', () => {
  let store: Record<string, string> = {};

  const localStorageMock = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };

  beforeEach(() => {
    store = {};
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
      configurable: true,
    });
    document.documentElement.className = '';

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    document.documentElement.className = '';
  });

  it('provides default theme and applies class to document.documentElement', () => {
    render(
      <ThemeProvider defaultTheme="dark" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('updates theme, toggles classes, and persists to localStorage', () => {
    render(
      <ThemeProvider defaultTheme="dark" storageKey="test-theme">
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('test-theme')).toBe('light');

    fireEvent.click(screen.getByText('Set Dark'));
    expect(screen.getByTestId('current-theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
    expect(localStorage.getItem('test-theme')).toBe('dark');
  });

  it('renders ThemeToggle, opens dropdown, and selects theme options', () => {
    render(
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <ThemeToggle />
      </ThemeProvider>
    );

    const toggleButton = screen.getByRole('button', { name: /toggle theme/i });
    expect(toggleButton).toBeDefined();

    // Open dropdown
    fireEvent.click(toggleButton);

    expect(screen.getByRole('menuitem', { name: /light/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /dark/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /system/i })).toBeDefined();

    // Click Light
    fireEvent.click(screen.getByRole('menuitem', { name: /light/i }));
    expect(localStorage.getItem('app-theme')).toBe('light');
  });
});
