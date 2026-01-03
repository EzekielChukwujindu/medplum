// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import { CopyButton } from './CopyButton';

describe('CopyButton', () => {
  beforeAll(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  test('Renders button', () => {
    render(() => <CopyButton text="hello" testId="copy" />);
    expect(screen.getByTestId('copy')).toBeTruthy();
  });

  test('Renders with custom label', () => {
    render(() => <CopyButton text="hello" label="Copy" testId="copy" />);
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  test('Has btn class', () => {
    render(() => <CopyButton text="hello" testId="copy" />);
    expect(screen.getByTestId('copy').classList.contains('btn')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <CopyButton text="hello" size="sm" testId="copy" />);
    expect(screen.getByTestId('copy').classList.contains('btn-sm')).toBe(true);
  });

  test('Applies variant class', () => {
    render(() => <CopyButton text="hello" variant="primary" testId="copy" />);
    expect(screen.getByTestId('copy').classList.contains('btn-primary')).toBe(true);
  });

  test('Copies text on click', async () => {
    render(() => <CopyButton text="test text" testId="copy" />);
    await fireEvent.click(screen.getByTestId('copy'));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test text');
  });
});
