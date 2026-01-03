// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { IdentifierInput } from './IdentifierInput';
import type { Identifier } from '@medplum/fhirtypes';

describe('IdentifierInput', () => {
  test('Renders empty by default', () => {
    render(() => <IdentifierInput name="id" path="" />);
    expect(screen.getByTestId('id-system')).toBeTruthy();
    expect(screen.getByTestId('id-value')).toBeTruthy();
  });

  test('Renders with default value', () => {
    const identifier: Identifier = {
      system: 'http://example.org',
      value: '12345',
    };
    render(() => <IdentifierInput name="id" path="" defaultValue={identifier} />);
    const systemInput = screen.getByTestId('id-system') as HTMLInputElement;
    expect(systemInput.value).toBe('http://example.org');
    const valueInput = screen.getByTestId('id-value') as HTMLInputElement;
    expect(valueInput.value).toBe('12345');
  });

  test('Calls onChange when system changes', () => {
    const handleChange = vi.fn();
    render(() => <IdentifierInput name="id" path="" onChange={handleChange} />);
    const systemInput = screen.getByTestId('id-system');
    fireEvent.input(systemInput, { target: { value: 'http://new.org' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].system).toBe('http://new.org');
  });

  test('Calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(() => <IdentifierInput name="id" path="" onChange={handleChange} />);
    const valueInput = screen.getByTestId('id-value');
    fireEvent.input(valueInput, { target: { value: 'ABC-123' } });
    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0][0].value).toBe('ABC-123');
  });

  test('Renders disabled', () => {
    render(() => <IdentifierInput name="id" path="" disabled />);
    const systemInput = screen.getByTestId('id-system') as HTMLInputElement;
    expect(systemInput.disabled).toBe(true);
  });
});
