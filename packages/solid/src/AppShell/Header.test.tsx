// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import { Header } from './Header';
import { Logo } from '../Logo/Logo';

describe('Header', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test('Renders header with navigation toggle', () => {
    const toggleMock = vi.fn();
    
    render(() => (
      <MockMedplumProvider>
        <Header
          logo={<Logo size={24} />}
          version="test.version"
          navbarToggle={toggleMock}
        />
      </MockMedplumProvider>
    ));

    // Header should render with toggle button
    const toggleButton = screen.getByLabelText('Toggle navigation');
    expect(toggleButton).toBeDefined();
  });

  test('Toggle navigation button calls callback', async () => {
    const toggleMock = vi.fn();
    
    render(() => (
      <MockMedplumProvider>
        <Header
          logo={<Logo size={24} />}
          version="test.version"
          navbarToggle={toggleMock}
        />
      </MockMedplumProvider>
    ));

    const toggleButton = screen.getByLabelText('Toggle navigation');
    fireEvent.click(toggleButton);
    
    expect(toggleMock).toHaveBeenCalled();
  });

  test('Renders user menu button', () => {
    render(() => (
      <MockMedplumProvider>
        <Header
          logo={<Logo size={24} />}
          version="test.version"
          navbarToggle={() => {}}
        />
      </MockMedplumProvider>
    ));

    const menuButton = screen.getByLabelText('User menu');
    expect(menuButton).toBeDefined();
  });
});
