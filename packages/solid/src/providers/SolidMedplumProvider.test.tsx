// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { MockClient } from '@medplum/mock';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SolidMedplumProvider } from './SolidMedplumProvider';
import { useMedplum } from '@medplum/solid-hooks';
import { useTheme } from './ThemeProvider';
import type { JSX } from 'solid-js';

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

function TestComponent(): JSX.Element {
  const medplum = useMedplum();
  const { resolvedTheme } = useTheme();
  return (
    <div>
      <div data-testid="medplum">{medplum ? 'connected' : 'not-connected'}</div>
      <div data-testid="theme">{resolvedTheme()}</div>
    </div>
  );
}

describe('SolidMedplumProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  test('Provides MedplumClient context', () => {
    const medplum = new MockClient();
    render(() => (
      <SolidMedplumProvider medplum={medplum}>
        <TestComponent />
      </SolidMedplumProvider>
    ));
    
    expect(screen.getByTestId('medplum').textContent).toBe('connected');
  });

  test('Provides ThemeProvider context', () => {
    const medplum = new MockClient();
    render(() => (
      <SolidMedplumProvider medplum={medplum} defaultTheme="dark">
        <TestComponent />
      </SolidMedplumProvider>
    ));
    
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  test('Uses system theme by default', () => {
    const medplum = new MockClient();
    render(() => (
      <SolidMedplumProvider medplum={medplum}>
        <TestComponent />
      </SolidMedplumProvider>
    ));
    
    // System defaults to 'light' in our mock
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });
});
