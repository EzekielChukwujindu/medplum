// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme  } from './ThemeProvider';
import type {StorageAdapter} from './ThemeProvider';
import type { JSX } from 'solid-js';

// Create a mock storage adapter
function createMockStorage(): StorageAdapter & { store: Record<string, string> } {
  const store: Record<string, string> = {};
  return {
    store,
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
  };
}

// Mock matchMedia
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });

function TestComponent(): JSX.Element {
  const { mode, resolvedTheme, setMode, toggle } = useTheme();
  return (
    <div>
      <div data-testid="mode">{mode()}</div>
      <div data-testid="resolved">{resolvedTheme()}</div>
      <button data-testid="set-dark" onClick={() => setMode('dark')}>Dark</button>
      <button data-testid="set-light" onClick={() => setMode('light')}>Light</button>
      <button data-testid="toggle" onClick={toggle}>Toggle</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  test('Provides default theme', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    expect(screen.getByTestId('mode').textContent).toBe('system');
  });

  test('Respects defaultMode prop', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider defaultMode="dark" storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
  });

  test('Sets theme on document', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider defaultMode="dark" storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('setMode updates theme', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider defaultMode="light" storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    
    fireEvent.click(screen.getByTestId('set-dark'));
    
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('toggle switches between light and dark', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider defaultMode="light" storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('resolved').textContent).toBe('dark');
    
    fireEvent.click(screen.getByTestId('toggle'));
    expect(screen.getByTestId('resolved').textContent).toBe('light');
  });

  test('Persists to storage adapter', () => {
    const mockStorage = createMockStorage();
    render(() => (
      <ThemeProvider storage={mockStorage}>
        <TestComponent />
      </ThemeProvider>
    ));
    
    fireEvent.click(screen.getByTestId('set-dark'));
    expect(mockStorage.setItem).toHaveBeenCalledWith('medplum-theme', 'dark');
  });

  test('Throws error when useTheme used outside provider', () => {
    expect(() => {
      render(() => <TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
  });
});
