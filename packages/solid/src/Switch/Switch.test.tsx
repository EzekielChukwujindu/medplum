// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Switch } from './Switch';

describe('Switch', () => {
  test('Renders with label', () => {
    render(() => <Switch label="Enable" testId="switch" />);
    expect(screen.getByText('Enable')).toBeTruthy();
  });

  test('Renders switch input', () => {
    render(() => <Switch testId="switch" />);
    expect(screen.getByTestId('switch')).toBeTruthy();
  });

  test('Is disabled when disabled prop set', () => {
    render(() => <Switch disabled testId="switch" />);
    const input = screen.getByTestId('switch') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
