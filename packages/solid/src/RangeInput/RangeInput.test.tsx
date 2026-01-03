// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { RangeInput } from './RangeInput';
import type { Range } from '@medplum/fhirtypes';

describe('RangeInput', () => {
  test('Renders low and high inputs', () => {
    render(() => <RangeInput name="range" path="" />);
    expect(screen.getByText('Low')).toBeTruthy();
    expect(screen.getByText('High')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const range: Range = {
      low: { value: 10, unit: 'mg' },
      high: { value: 100, unit: 'mg' },
    };
    render(() => <RangeInput name="range" path="" defaultValue={range} />);
    const lowValueInput = screen.getByTestId('range-low-value') as HTMLInputElement;
    expect(lowValueInput.value).toBe('10');
    const highValueInput = screen.getByTestId('range-high-value') as HTMLInputElement;
    expect(highValueInput.value).toBe('100');
  });

  test('Calls onChange when low value changes', () => {
    const handleChange = vi.fn();
    render(() => <RangeInput name="range" path="" onChange={handleChange} />);
    const lowValueInput = screen.getByTestId('range-low-value');
    fireEvent.input(lowValueInput, { target: { value: '5' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].low.value).toBe(5);
  });

  test('Calls onChange when high value changes', () => {
    const handleChange = vi.fn();
    render(() => <RangeInput name="range" path="" onChange={handleChange} />);
    const highValueInput = screen.getByTestId('range-high-value');
    fireEvent.input(highValueInput, { target: { value: '200' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].high.value).toBe(200);
  });

  test('Renders disabled', () => {
    render(() => <RangeInput name="range" path="" disabled />);
    const lowValueInput = screen.getByTestId('range-low-value') as HTMLInputElement;
    expect(lowValueInput.disabled).toBe(true);
  });
});
