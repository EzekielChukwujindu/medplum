// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  test('Renders status text', () => {
    render(() => <StatusBadge status="active" testId="badge" />);
    expect(screen.getByText('active')).toBeTruthy();
  });

  test('Replaces hyphens with spaces', () => {
    render(() => <StatusBadge status="in-progress" testId="badge" />);
    expect(screen.getByText('in progress')).toBeTruthy();
  });

  test('Applies success color for completed', () => {
    render(() => <StatusBadge status="completed" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-success')).toBe(true);
  });

  test('Applies error color for failed', () => {
    render(() => <StatusBadge status="failed" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-error')).toBe(true);
  });

  test('Applies warning color for on-hold', () => {
    render(() => <StatusBadge status="on-hold" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-warning')).toBe(true);
  });

  test('Applies primary color for active', () => {
    render(() => <StatusBadge status="active" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-primary')).toBe(true);
  });

  test('Uses ghost for unknown status', () => {
    render(() => <StatusBadge status="some-unknown-status" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-ghost')).toBe(true);
  });

  test('Allows color override', () => {
    render(() => <StatusBadge status="active" color="badge-accent" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-accent')).toBe(true);
  });

  test('Applies size class', () => {
    render(() => <StatusBadge status="active" size="lg" testId="badge" />);
    const badge = screen.getByTestId('badge');
    expect(badge.classList.contains('badge-lg')).toBe(true);
  });
});
