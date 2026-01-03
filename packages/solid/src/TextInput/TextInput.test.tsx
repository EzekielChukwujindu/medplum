// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  test('Renders with placeholder', () => {
    render(() => <TextInput placeholder="Enter text" testId="input" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => <TextInput label="Email" name="email" />);
    expect(screen.getByText('Email')).toBeTruthy();
  });

  test('Shows required asterisk', () => {
    render(() => <TextInput label="Name" required />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Shows error message', () => {
    render(() => <TextInput error="Invalid input" testId="input" />);
    expect(screen.getByText('Invalid input')).toBeTruthy();
  });

  test('Calls onChange', () => {
    const handleChange = vi.fn();
    render(() => <TextInput onChange={handleChange} testId="input" />);
    const input = screen.getByTestId('input');
    fireEvent.input(input, { target: { value: 'test value' } });
    expect(handleChange).toHaveBeenCalledWith('test value');
  });

  test('Renders disabled', () => {
    render(() => <TextInput disabled testId="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
