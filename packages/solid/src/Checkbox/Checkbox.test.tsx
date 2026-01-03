// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Checkbox, Radio } from './Checkbox';

describe('Checkbox', () => {
  test('Renders with label', () => {
    render(() => <Checkbox label="Accept terms" testId="checkbox" />);
    expect(screen.getByText('Accept terms')).toBeTruthy();
  });

  test('Renders checkbox input', () => {
    render(() => <Checkbox testId="checkbox" />);
    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    expect(checkbox.type).toBe('checkbox');
  });

  test('Calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(() => <Checkbox onChange={handleChange} testId="checkbox" />);
    fireEvent.click(screen.getByTestId('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('Renders disabled', () => {
    render(() => <Checkbox disabled testId="checkbox" />);
    const checkbox = screen.getByTestId('checkbox') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  test('Applies variant class', () => {
    render(() => <Checkbox variant="primary" testId="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.classList.contains('checkbox-primary')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <Checkbox size="lg" testId="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.classList.contains('checkbox-lg')).toBe(true);
  });
});

describe('Radio', () => {
  test('Renders with label', () => {
    render(() => <Radio name="option" value="a" label="Option A" testId="radio" />);
    expect(screen.getByText('Option A')).toBeTruthy();
  });

  test('Renders radio input', () => {
    render(() => <Radio name="option" value="a" testId="radio" />);
    const radio = screen.getByTestId('radio') as HTMLInputElement;
    expect(radio.type).toBe('radio');
  });

  test('Calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(() => <Radio name="option" value="a" onChange={handleChange} testId="radio" />);
    fireEvent.click(screen.getByTestId('radio'));
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  test('Renders disabled', () => {
    render(() => <Radio name="option" value="a" disabled testId="radio" />);
    const radio = screen.getByTestId('radio') as HTMLInputElement;
    expect(radio.disabled).toBe(true);
  });

  test('Applies variant class', () => {
    render(() => <Radio name="option" value="a" variant="primary" testId="radio" />);
    const radio = screen.getByTestId('radio');
    expect(radio.classList.contains('radio-primary')).toBe(true);
  });
});
