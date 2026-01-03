// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { ContactPointInput } from './ContactPointInput';
import type { ContactPoint } from '@medplum/fhirtypes';

describe('ContactPointInput', () => {
  test('Renders empty by default', () => {
    render(() => <ContactPointInput />);
    expect(screen.getByTestId('contact-system')).toBeTruthy();
    expect(screen.getByTestId('contact-use')).toBeTruthy();
    expect(screen.getByPlaceholderText('Value')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const cp: ContactPoint = {
      system: 'email',
      use: 'work',
      value: 'test@example.com',
    };
    render(() => <ContactPointInput defaultValue={cp} />);
    const systemSelect = screen.getByTestId('contact-system') as HTMLSelectElement;
    expect(systemSelect.value).toBe('email');
    const valueInput = screen.getByPlaceholderText('Value') as HTMLInputElement;
    expect(valueInput.value).toBe('test@example.com');
  });

  test('Calls onChange when system changes', () => {
    const handleChange = vi.fn();
    render(() => <ContactPointInput onChange={handleChange} />);
    const systemSelect = screen.getByTestId('contact-system');
    fireEvent.change(systemSelect, { target: { value: 'phone' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].system).toBe('phone');
  });

  test('Calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(() => <ContactPointInput onChange={handleChange} />);
    const valueInput = screen.getByPlaceholderText('Value');
    fireEvent.input(valueInput, { target: { value: '555-1234' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].value).toBe('555-1234');
  });

  test('Renders disabled', () => {
    render(() => <ContactPointInput disabled />);
    const valueInput = screen.getByPlaceholderText('Value') as HTMLInputElement;
    expect(valueInput.disabled).toBe(true);
  });
});
