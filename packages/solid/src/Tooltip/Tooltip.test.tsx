// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  test('Renders children', () => {
    render(() => (
      <Tooltip label="Help text">
        <button>Hover me</button>
      </Tooltip>
    ));
    expect(screen.getByText('Hover me')).toBeTruthy();
  });

  test('Has data-tip attribute', () => {
    render(() => (
      <Tooltip label="Help text">
        <button data-testid="btn">Hover me</button>
      </Tooltip>
    ));
    const wrapper = screen.getByText('Hover me').parentElement;
    expect(wrapper?.getAttribute('data-tip')).toBe('Help text');
  });

  test('Applies tooltip-top by default', () => {
    render(() => (
      <Tooltip label="Help">
        <span data-testid="content">Content</span>
      </Tooltip>
    ));
    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper?.classList.contains('tooltip-top')).toBe(true);
  });

  test('Applies tooltip-bottom position', () => {
    render(() => (
      <Tooltip label="Help" position="bottom">
        <span>Content</span>
      </Tooltip>
    ));
    const wrapper = screen.getByText('Content').parentElement;
    expect(wrapper?.classList.contains('tooltip-bottom')).toBe(true);
  });

  test('Renders just children when disabled', () => {
    render(() => (
      <Tooltip label="Help" disabled>
        <button data-testid="btn">Click me</button>
      </Tooltip>
    ));
    const btn = screen.getByTestId('btn');
    // When disabled, no tooltip wrapper
    expect(btn.parentElement?.classList.contains('tooltip')).toBe(false);
  });
});
