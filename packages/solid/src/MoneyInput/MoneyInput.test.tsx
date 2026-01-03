// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { MoneyInput } from './MoneyInput';
import type { Money } from '@medplum/fhirtypes';

describe('MoneyInput', () => {
  test('Renders value and currency inputs', () => {
    render(() => <MoneyInput name="money" path="" />);
    expect(screen.getByTestId('money-value')).toBeTruthy();
    expect(screen.getByTestId('money-currency')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const money: Money = {
      value: 99.99,
      currency: 'EUR',
    };
    render(() => <MoneyInput name="money" path="" defaultValue={money} />);
    const valueInput = screen.getByTestId('money-value') as HTMLInputElement;
    expect(valueInput.value).toBe('99.99');
    const currencySelect = screen.getByTestId('money-currency') as HTMLSelectElement;
    expect(currencySelect.value).toBe('EUR');
  });

  test('Renders with label', () => {
    render(() => <MoneyInput name="money" path="" label="Amount" />);
    expect(screen.getByText('Amount')).toBeTruthy();
  });

  test('Calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(() => <MoneyInput name="money" path="" onChange={handleChange} />);
    const valueInput = screen.getByTestId('money-value');
    fireEvent.input(valueInput, { target: { value: '50.00', valueAsNumber: 50 } });
    expect(handleChange).toHaveBeenCalled();
  });

  test('Calls onChange when currency changes', () => {
    const handleChange = vi.fn();
    render(() => <MoneyInput name="money" path="" onChange={handleChange} />);
    const currencySelect = screen.getByTestId('money-currency');
    fireEvent.change(currencySelect, { target: { value: 'GBP' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].currency).toBe('GBP');
  });

  test('Renders disabled', () => {
    render(() => <MoneyInput name="money" path="" disabled />);
    const valueInput = screen.getByTestId('money-value') as HTMLInputElement;
    expect(valueInput.disabled).toBe(true);
  });
});
