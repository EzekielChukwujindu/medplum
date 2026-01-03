// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Alert } from './Alert';

describe('Alert', () => {
  test('Renders content', () => {
    render(() => <Alert testId="alert">This is an alert</Alert>);
    expect(screen.getByText('This is an alert')).toBeTruthy();
  });

  test('Renders with title', () => {
    render(() => (
      <Alert title="Important" testId="alert">
        Alert content
      </Alert>
    ));
    expect(screen.getByText('Important')).toBeTruthy();
    expect(screen.getByText('Alert content')).toBeTruthy();
  });

  test('Applies info type by default', () => {
    render(() => <Alert testId="alert">Info alert</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert.classList.contains('alert-info')).toBe(true);
  });

  test('Applies success type', () => {
    render(() => <Alert type="success" testId="alert">Success!</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert.classList.contains('alert-success')).toBe(true);
  });

  test('Applies warning type', () => {
    render(() => <Alert type="warning" testId="alert">Warning!</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert.classList.contains('alert-warning')).toBe(true);
  });

  test('Applies error type', () => {
    render(() => <Alert type="error" testId="alert">Error!</Alert>);
    const alert = screen.getByTestId('alert');
    expect(alert.classList.contains('alert-error')).toBe(true);
  });

  test('Shows dismiss button when dismissible', () => {
    const handleDismiss = vi.fn();
    render(() => (
      <Alert dismissible onDismiss={handleDismiss} testId="alert">
        Dismissible alert
      </Alert>
    ));
    expect(screen.getByTestId('alert-dismiss')).toBeTruthy();
  });

  test('Calls onDismiss when dismiss clicked', () => {
    const handleDismiss = vi.fn();
    render(() => (
      <Alert dismissible onDismiss={handleDismiss} testId="alert">
        Dismissible alert
      </Alert>
    ));
    fireEvent.click(screen.getByTestId('alert-dismiss'));
    expect(handleDismiss).toHaveBeenCalled();
  });
});
