// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Toggle } from './Toggle';

describe('Toggle', () => {
  test('Renders with label', () => {
    render(() => <Toggle label="Enable feature" testId="toggle" />);
    expect(screen.getByText('Enable feature')).toBeTruthy();
  });

  test('Renders toggle input', () => {
    render(() => <Toggle testId="toggle" />);
    const toggle = screen.getByTestId('toggle') as HTMLInputElement;
    expect(toggle.type).toBe('checkbox');
    expect(toggle.classList.contains('toggle')).toBe(true);
  });

  test('Calls onChange when clicked', () => {
    const handleChange = vi.fn();
    render(() => <Toggle onChange={handleChange} testId="toggle" />);
    fireEvent.click(screen.getByTestId('toggle'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  test('Renders disabled', () => {
    render(() => <Toggle disabled testId="toggle" />);
    const toggle = screen.getByTestId('toggle') as HTMLInputElement;
    expect(toggle.disabled).toBe(true);
  });

  test('Applies variant class', () => {
    render(() => <Toggle variant="success" testId="toggle" />);
    const toggle = screen.getByTestId('toggle');
    expect(toggle.classList.contains('toggle-success')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <Toggle size="lg" testId="toggle" />);
    const toggle = screen.getByTestId('toggle');
    expect(toggle.classList.contains('toggle-lg')).toBe(true);
  });

  test('Renders label on left', () => {
    render(() => <Toggle label="Left label" labelPosition="left" testId="toggle" />);
    expect(screen.getByText('Left label')).toBeTruthy();
  });
});
