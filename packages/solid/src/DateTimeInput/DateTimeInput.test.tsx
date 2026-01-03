// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { DateTimeInput } from './DateTimeInput';

describe('DateTimeInput', () => {
  test('Renders with label', () => {
    render(() => <DateTimeInput label="Date" name="date" />);
    expect(screen.getByText('Date')).toBeTruthy();
  });

  test('Renders with testId', () => {
    render(() => <DateTimeInput testId="datetime-input" />);
    expect(screen.getByTestId('datetime-input')).toBeTruthy();
  });

  test('Shows required asterisk', () => {
    render(() => <DateTimeInput label="Date" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => <DateTimeInput disabled testId="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('Calls onChange with ISO value', () => {
    const handleChange = vi.fn();
    render(() => <DateTimeInput onChange={handleChange} testId="input" />);
    const input = screen.getByTestId('input');
    fireEvent.input(input, { target: { value: '2024-01-15T10:30' } });
    expect(handleChange).toHaveBeenCalled();
    const calledWith = handleChange.mock.calls[0][0];
    expect(calledWith).toContain('2024-01-15');
  });
});
