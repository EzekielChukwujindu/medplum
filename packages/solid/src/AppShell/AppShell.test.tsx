// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import { AppShell } from './AppShell';
import type { NavbarMenu } from './Navbar';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

const testMenus: NavbarMenu[] = [
  {
    title: 'Main',
    links: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/patients', label: 'Patients' },
    ],
  },
];

describe('AppShell', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  test('Renders loading state when medplum is loading', () => {
    render(() => (
      <MockMedplumProvider isLoading={true}>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(document.querySelector('.loading-spinner')).toBeDefined();
  });

  test('Renders children when authenticated', () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <div data-testid="content">Main Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.getByTestId('content')).toBeDefined();
    expect(screen.getByText('Main Content')).toBeDefined();
  });

  test('Shows navbar when profile exists', () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.getByRole('navigation')).toBeDefined();
  });

  test('Renders menu links', () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.getByText('Dashboard')).toBeDefined();
    expect(screen.getByText('Patients')).toBeDefined();
  });

  test('Shows header in v1 layout', () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus} layoutVersion="v1">
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.getByRole('banner')).toBeDefined();
  });

  test('Hides header in v2 layout', () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus} layoutVersion="v2">
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.queryByRole('banner')).toBeNull();
  });

  test('Navbar toggle button works', async () => {
    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <div>Content</div>
        </AppShell>
      </MockMedplumProvider>
    ));

    const toggleButton = screen.getByLabelText('Toggle navigation');
    expect(toggleButton).toBeDefined();
    
    await fireEvent.click(toggleButton);
    expect(mockLocalStorage.setItem).toHaveBeenCalled();
  });

  test('Handles ErrorBoundary', () => {
    const ThrowingComponent = () => {
      throw new Error('Test error');
    };

    render(() => (
      <MockMedplumProvider>
        <AppShell logo={<span>Logo</span>} menus={testMenus}>
          <ThrowingComponent />
        </AppShell>
      </MockMedplumProvider>
    ));

    expect(screen.getByText(/Error:/)).toBeDefined();
  });
});
