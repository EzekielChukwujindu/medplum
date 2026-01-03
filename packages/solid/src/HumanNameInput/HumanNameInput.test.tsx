// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { HumanNameInput } from './HumanNameInput';
import type { HumanName } from '@medplum/fhirtypes';

describe('HumanNameInput', () => {
  test('Renders empty by default', () => {
    render(() => <HumanNameInput name="" path="" />);
    expect(screen.getByTestId('name-use')).toBeTruthy();
    expect(screen.getByPlaceholderText('Given')).toBeTruthy();
    expect(screen.getByPlaceholderText('Family')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const name: HumanName = {
      use: 'official',
      given: ['John', 'Jacob'],
      family: 'Smith',
    };
    render(() => <HumanNameInput name="" path="" defaultValue={name} />);
    const givenInput = screen.getByPlaceholderText('Given') as HTMLInputElement;
    expect(givenInput.value).toBe('John Jacob');
  });

  test('Calls onChange when given name changes', () => {
    const handleChange = vi.fn();
    render(() => <HumanNameInput name="" path="" onChange={handleChange} />);
    const givenInput = screen.getByPlaceholderText('Given');
    fireEvent.input(givenInput, { target: { value: 'Jane' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].given).toEqual(['Jane']);
  });

  test('Calls onChange when family name changes', () => {
    const handleChange = vi.fn();
    render(() => <HumanNameInput name="" path="" onChange={handleChange} />);
    const familyInput = screen.getByPlaceholderText('Family');
    fireEvent.input(familyInput, { target: { value: 'Doe' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].family).toBe('Doe');
  });

  test('Renders disabled', () => {
    render(() => <HumanNameInput name="" path="" disabled />);
    const familyInput = screen.getByPlaceholderText('Family') as HTMLInputElement;
    expect(familyInput.disabled).toBe(true);
  });
});
