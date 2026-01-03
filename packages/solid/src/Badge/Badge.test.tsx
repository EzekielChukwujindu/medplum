// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Badge } from './Badge';

describe('Badge', () => {
  test('Renders children', () => {
    render(() => <Badge testId="badge">New</Badge>);
    expect(screen.getByText('New')).toBeTruthy();
  });

  test('Has badge class', () => {
    render(() => <Badge testId="badge">Label</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge')).toBe(true);
  });

  test('Applies primary variant', () => {
    render(() => <Badge variant="primary" testId="badge">Primary</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-primary')).toBe(true);
  });

  test('Applies success variant', () => {
    render(() => <Badge variant="success" testId="badge">Success</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-success')).toBe(true);
  });

  test('Applies error variant', () => {
    render(() => <Badge variant="error" testId="badge">Error</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-error')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <Badge size="lg" testId="badge">Large</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-lg')).toBe(true);
  });

  test('Applies outline variant', () => {
    render(() => <Badge variant="outline" testId="badge">Outline</Badge>);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-outline')).toBe(true);
  });
});
