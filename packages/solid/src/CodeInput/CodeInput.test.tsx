// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { CodeInput } from './CodeInput';

const medplum = new MockClient();
const binding = 'https://example.com/test';

describe('CodeInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const defaultProps = { maxValues: 1, binding, name: 'test', onChange: undefined };

  function setup(props = defaultProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <CodeInput {...props} />
      </MedplumProvider>
    ));
  }

  test('Renders', async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeTruthy();
    });
  });

  test('Renders string default value', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <CodeInput {...defaultProps} defaultValue="xyz" maxValues={undefined} />
      </MedplumProvider>
    ));

    await waitFor(() => {
      expect(screen.getByRole('combobox')).toBeTruthy();
      expect(screen.getByText('xyz')).toBeTruthy();
    });
  });

  test('Searches for results', async () => {
    setup();

    await waitFor(() => {
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input).toBeTruthy();
    });

    const input = screen.getByRole('combobox') as HTMLInputElement;

    // Enter random text
    fireEvent.change(input, { target: { value: 'Test' } });

    // Wait for the drop down
    await vi.advanceTimersByTimeAsync(1000);

    // Press the down arrow
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    // Press "Enter"
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  });

  test('Searches for results with creatable set to false', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <CodeInput {...defaultProps} creatable={false} />
      </MedplumProvider>
    ));

    await waitFor(() => {
      const input = screen.getByRole('combobox') as HTMLInputElement;
      expect(input).toBeTruthy();
    });

    const input = screen.getByRole('combobox') as HTMLInputElement;

    // Enter random text
    fireEvent.change(input, { target: { value: 'Test' } });

    // Wait for the drop down
    await vi.advanceTimersByTimeAsync(1000);

    // Press the down arrow
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    // Press "Enter"
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  });
});
