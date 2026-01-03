// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  test('Renders with placeholder', () => {
    render(() => <Textarea placeholder="Enter text..." testId="textarea" />);
    expect(screen.getByPlaceholderText('Enter text...')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => <Textarea label="Description" testId="textarea" />);
    expect(screen.getByText('Description')).toBeTruthy();
  });

  test('Shows required indicator', () => {
    render(() => <Textarea label="Required Field" required testId="textarea" />);
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Shows error message', () => {
    render(() => <Textarea error="This field has an error" testId="textarea" />);
    expect(screen.getByText('This field has an error')).toBeTruthy();
  });

  test('Shows helper text', () => {
    render(() => <Textarea helperText="Enter a description" testId="textarea" />);
    expect(screen.getByText('Enter a description')).toBeTruthy();
  });

  test('Calls onChange when typing', () => {
    const handleChange = vi.fn();
    render(() => <Textarea onChange={handleChange} testId="textarea" />);
    const textarea = screen.getByTestId('textarea');
    fireEvent.input(textarea, { target: { value: 'New text' } });
    expect(handleChange).toHaveBeenCalledWith('New text');
  });

  test('Renders disabled', () => {
    render(() => <Textarea disabled testId="textarea" />);
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  test('Sets custom rows', () => {
    render(() => <Textarea rows={5} testId="textarea" />);
    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.rows).toBe(5);
  });
});
