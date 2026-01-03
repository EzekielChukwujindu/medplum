// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import { HeaderSearchInput } from './HeaderSearchInput';

const navigateMock = vi.fn();

// Create a custom client
const medplum = new MockClient();

describe('HeaderSearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    navigateMock.mockClear();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  function setup(pathname?: string): void {
    render(() => (
      <MockMedplumProvider medplum={medplum} navigate={navigateMock}>
        <HeaderSearchInput pathname={pathname} />
      </MockMedplumProvider>
    ));
  }

  test('Renders empty', async () => {
    setup();
    // Wait for any async rendering
    await vi.advanceTimersByTimeAsync(100);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
  });

  test('Search submits cleanly', async () => {
    setup();
    await vi.advanceTimersByTimeAsync(100);
    
    const input = screen.getByLabelText('Search') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form')!);

    expect(navigateMock).toHaveBeenCalledWith('/search?q=test');
  });

  test('Search in Context', async () => {
    setup('/Patient');
    await vi.advanceTimersByTimeAsync(100);
    
    const input = screen.getByLabelText('Search') as HTMLInputElement;
    expect(input.placeholder).toContain('Search Patient');

    fireEvent.input(input, { target: { value: 'test' } });
    fireEvent.submit(input.closest('form')!);
    
    expect(navigateMock).toHaveBeenCalledWith('/Patient?_filter=test');
  });
});
