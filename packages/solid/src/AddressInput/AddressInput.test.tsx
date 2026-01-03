// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { AddressInput } from './AddressInput';
import type { Address } from '@medplum/fhirtypes';
import type { AddressInputProps } from './AddressInput';

const defaultProps: AddressInputProps = {
  name: 'a',
  path: 'Patient.address',
  onChange: undefined,
  outcome: undefined,
};

describe('AddressInput', () => {
  test('Renders empty by default', () => {
    render(() => <AddressInput {...defaultProps} />);
    expect(screen.getByTestId('address-use')).toBeTruthy();
    expect(screen.getByTestId('address-type')).toBeTruthy();
    expect(screen.getByPlaceholderText('Line 1')).toBeTruthy();
    expect(screen.getByPlaceholderText('City')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const address: Address = {
      use: 'home',
      line: ['123 Main St'],
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
    };
    render(() => <AddressInput {...defaultProps} defaultValue={address} />);
    const useSelect = screen.getByTestId('address-use') as HTMLSelectElement;
    expect(useSelect.value).toBe('home');
    expect(screen.getByDisplayValue('123 Main St')).toBeTruthy();
    expect(screen.getByDisplayValue('Boston')).toBeTruthy();
  });

  test('Calls onChange when use changes', () => {
    const handleChange = vi.fn();
    render(() => <AddressInput {...defaultProps} onChange={handleChange} />);
    const useSelect = screen.getByTestId('address-use');
    fireEvent.change(useSelect, { target: { value: 'work' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].use).toBe('work');
  });

  test('Calls onChange when city changes', () => {
    const handleChange = vi.fn();
    render(() => <AddressInput {...defaultProps} onChange={handleChange} />);
    const cityInput = screen.getByPlaceholderText('City');
    fireEvent.input(cityInput, { target: { value: 'Cambridge' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].city).toBe('Cambridge');
  });

  test('Renders disabled', () => {
    render(() => <AddressInput {...defaultProps} disabled />);
    const cityInput = screen.getByPlaceholderText('City') as HTMLInputElement;
    expect(cityInput.disabled).toBe(true);
  });

  test('Set value', () => {
    let lastValue: Address | undefined = undefined;

    render(() => <AddressInput {...defaultProps} onChange={(value) => (lastValue = value)} />);

    fireEvent.change(screen.getByTestId('address-use'), {
      target: { value: 'home' },
    });

    fireEvent.change(screen.getByTestId('address-type'), {
      target: { value: 'both' },
    });

    fireEvent.input(screen.getByPlaceholderText('Line 1'), {
      target: { value: '742 Evergreen Terrace' },
    });

    fireEvent.input(screen.getByPlaceholderText('Line 2'), {
      target: { value: 'Attn: Homer' },
    });

    fireEvent.input(screen.getByPlaceholderText('City'), {
      target: { value: 'Springfield' },
    });

    fireEvent.input(screen.getByPlaceholderText('State'), {
      target: { value: 'OR' },
    });

    fireEvent.input(screen.getByPlaceholderText('Postal Code'), {
      target: { value: '97403' },
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({
      use: 'home',
      type: 'both',
      line: ['742 Evergreen Terrace', 'Attn: Homer'],
      city: 'Springfield',
      state: 'OR',
      postalCode: '97403',
    });
  });

  test('Remove 2nd line', () => {
    let lastValue: Address | undefined = undefined;

    render(() => (
      <AddressInput
        {...defaultProps}
        defaultValue={{ line: ['line 1', 'line 2'] }}
        onChange={(value) => (lastValue = value)}
      />
    ));

    fireEvent.input(screen.getByPlaceholderText('Line 2'), {
      target: { value: '' },
    });

    expect(lastValue).toBeDefined();
    expect(lastValue).toMatchObject({ line: ['line 1'] });
  });
});
