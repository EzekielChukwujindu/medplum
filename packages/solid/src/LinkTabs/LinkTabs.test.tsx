// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { LinkTabs } from './LinkTabs';

const medplum = new MockClient();
const navigateMock = vi.fn();

describe('LinkTabs', () => {
  beforeEach(() => {
    navigateMock.mockClear();
    // Mock window.location.pathname
    Object.defineProperty(window, 'location', {
      value: { pathname: '/patient/123/overview' },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const defaultProps = {
    baseUrl: '/patient/123',
    tabs: ['Overview', 'Timeline', 'Details'],
  };

  function setup(props = {}): void {
    render(() => (
      <MedplumProvider medplum={medplum} navigate={navigateMock}>
        <LinkTabs {...defaultProps} {...props} />
      </MedplumProvider>
    ));
  }

  test('renders tabs correctly', async () => {
    setup();
    await waitFor(() => {
      expect(screen.getByRole('tablist')).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Overview' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Timeline' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Details' })).toBeTruthy();
    });
  });

  test('navigates when tab is clicked', async () => {
    setup();

    await waitFor(() => {
      const timelineTab = screen.getByRole('tab', { name: 'Timeline' });
      expect(timelineTab).toBeTruthy();
    });

    const timelineTab = screen.getByRole('tab', { name: 'Timeline' });
    fireEvent.click(timelineTab);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/patient/123/timeline');
    });
  });

  test('renders with tab definitions', async () => {
    setup({
      tabs: [
        { label: 'First', value: 'first' },
        { label: 'Second', value: 'second' },
      ],
    });

    await waitFor(() => {
      expect(screen.getByRole('tab', { name: 'First' })).toBeTruthy();
      expect(screen.getByRole('tab', { name: 'Second' })).toBeTruthy();
    });
  });

  test('marks active tab', async () => {
    setup();

    await waitFor(() => {
      const overviewTab = screen.getByRole('tab', { name: 'Overview' });
      expect(overviewTab.classList.contains('tab-active')).toBe(true);
    });
  });
});
