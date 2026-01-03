// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { RatioInput } from './RatioInput';
import type { Ratio } from '@medplum/fhirtypes';

describe('RatioInput', () => {
  test('Renders numerator and denominator inputs', () => {
    render(() => <RatioInput name="ratio" path="" />);
    expect(screen.getByText('Numerator')).toBeTruthy();
    expect(screen.getByText('Denominator')).toBeTruthy();
    expect(screen.getByText('/')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const ratio: Ratio = {
      numerator: { value: 1, unit: 'mg' },
      denominator: { value: 2, unit: 'mL' },
    };
    render(() => <RatioInput name="ratio" path="" defaultValue={ratio} />);
    const numValueInput = screen.getByTestId('ratio-num-value') as HTMLInputElement;
    expect(numValueInput.value).toBe('1');
    const denomValueInput = screen.getByTestId('ratio-denom-value') as HTMLInputElement;
    expect(denomValueInput.value).toBe('2');
  });

  test('Calls onChange when numerator changes', () => {
    const handleChange = vi.fn();
    render(() => <RatioInput name="ratio" path="" onChange={handleChange} />);
    const numValueInput = screen.getByTestId('ratio-num-value');
    fireEvent.input(numValueInput, { target: { value: '5' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].numerator.value).toBe(5);
  });

  test('Calls onChange when denominator changes', () => {
    const handleChange = vi.fn();
    render(() => <RatioInput name="ratio" path="" onChange={handleChange} />);
    const denomValueInput = screen.getByTestId('ratio-denom-value');
    fireEvent.input(denomValueInput, { target: { value: '10' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].denominator.value).toBe(10);
  });

  test('Renders disabled', () => {
    render(() => <RatioInput name="ratio" path="" disabled />);
    const numValueInput = screen.getByTestId('ratio-num-value') as HTMLInputElement;
    expect(numValueInput.disabled).toBe(true);
  });
});
