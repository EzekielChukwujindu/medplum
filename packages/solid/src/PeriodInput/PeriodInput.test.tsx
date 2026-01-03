// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { PeriodInput } from './PeriodInput';

describe('PeriodInput', () => {
  test('Renders start and end inputs', () => {
    render(() => <PeriodInput name="period" path="" />);
    expect(screen.getByTestId('period-start')).toBeTruthy();
    expect(screen.getByTestId('period-end')).toBeTruthy();
  });

  test('Renders labels', () => {
    render(() => <PeriodInput name="period" path="" />);
    expect(screen.getByText('Start')).toBeTruthy();
    expect(screen.getByText('End')).toBeTruthy();
  });

  test('Calls onChange when start changes', () => {
    const handleChange = vi.fn();
    render(() => <PeriodInput name="period" path="" onChange={handleChange} />);
    const startInput = screen.getByTestId('period-start');
    fireEvent.input(startInput, { target: { value: '2024-01-01T10:00' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].start).toBeTruthy();
  });

  test('Calls onChange when end changes', () => {
    const handleChange = vi.fn();
    render(() => <PeriodInput name="period" path="" onChange={handleChange} />);
    const endInput = screen.getByTestId('period-end');
    fireEvent.input(endInput, { target: { value: '2024-01-31T18:00' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].end).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => <PeriodInput name="period" path="" disabled />);
    const startInput = screen.getByTestId('period-start') as HTMLInputElement;
    expect(startInput.disabled).toBe(true);
  });
});
