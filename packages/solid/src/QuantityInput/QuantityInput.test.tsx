// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { QuantityInput } from './QuantityInput';
import type { Quantity } from '@medplum/fhirtypes';

describe('QuantityInput', () => {
  test('Renders empty by default', () => {
    render(() => <QuantityInput name="qty" path="" />);
    expect(screen.getByTestId('qty-comparator')).toBeTruthy();
    expect(screen.getByTestId('qty-value')).toBeTruthy();
    expect(screen.getByTestId('qty-unit')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const qty: Quantity = {
      value: 100,
      unit: 'mg',
      comparator: '>=',
    };
    render(() => <QuantityInput name="qty" path="" defaultValue={qty} />);
    const valueInput = screen.getByTestId('qty-value') as HTMLInputElement;
    expect(valueInput.value).toBe('100');
    const unitInput = screen.getByTestId('qty-unit') as HTMLInputElement;
    expect(unitInput.value).toBe('mg');
  });

  test('Calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(() => <QuantityInput name="qty" path="" onChange={handleChange} />);
    const valueInput = screen.getByTestId('qty-value');
    fireEvent.input(valueInput, { target: { value: '50' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].value).toBe(50);
  });

  test('Calls onChange when unit changes', () => {
    const handleChange = vi.fn();
    render(() => <QuantityInput name="qty" path="" onChange={handleChange} />);
    const unitInput = screen.getByTestId('qty-unit');
    fireEvent.input(unitInput, { target: { value: 'kg' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].unit).toBe('kg');
  });

  test('Renders disabled', () => {
    render(() => <QuantityInput name="qty" path="" disabled />);
    const valueInput = screen.getByTestId('qty-value') as HTMLInputElement;
    expect(valueInput.disabled).toBe(true);
  });
});
