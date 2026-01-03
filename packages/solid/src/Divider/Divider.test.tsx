// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Divider, Kbd } from './Divider';

describe('Divider', () => {
  test('Renders divider', () => {
    render(() => <Divider testId="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider.classList.contains('divider')).toBe(true);
  });

  test('Renders with label', () => {
    render(() => <Divider label="OR" testId="divider" />);
    expect(screen.getByText('OR')).toBeTruthy();
  });

  test('Applies vertical orientation', () => {
    render(() => <Divider orientation="vertical" testId="divider" />);
    const divider = screen.getByTestId('divider');
    expect(divider.classList.contains('divider-horizontal')).toBe(true);
  });
});

describe('Kbd', () => {
  test('Renders keyboard key', () => {
    render(() => <Kbd>Ctrl</Kbd>);
    expect(screen.getByText('Ctrl')).toBeTruthy();
  });

  test('Has kbd class', () => {
    render(() => <Kbd>Enter</Kbd>);
    const kbd = screen.getByText('Enter');
    expect(kbd.classList.contains('kbd')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <Kbd size="lg">Shift</Kbd>);
    const kbd = screen.getByText('Shift');
    expect(kbd.classList.contains('kbd-lg')).toBe(true);
  });
});
