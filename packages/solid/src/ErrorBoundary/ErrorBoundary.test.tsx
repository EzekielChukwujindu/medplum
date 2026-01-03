// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import type { JSX } from 'solid-js';

// Component that throws an error
function ThrowingComponent(): JSX.Element {
  throw new Error('Test error message');
}

// Component that works fine
function WorkingComponent(): JSX.Element {
  return <div data-testid="working">Working!</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for expected errors
  const originalError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });
  afterEach(() => {
    console.error = originalError;
  });

  test('Renders children when no error', () => {
    render(() => (
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    ));
    
    expect(screen.getByTestId('working')).toBeTruthy();
  });

  test('Renders error fallback when child throws', () => {
    render(() => (
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    ));
    
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/Test error message/)).toBeTruthy();
  });

  test('Renders custom fallback when provided', () => {
    const customFallback = (err: Error) => (
      <div data-testid="custom-fallback">Custom: {err.message}</div>
    );

    render(() => (
      <ErrorBoundary fallback={customFallback}>
        <ThrowingComponent />
      </ErrorBoundary>
    ));
    
    expect(screen.getByTestId('custom-fallback')).toBeTruthy();
    expect(screen.getByText('Custom: Test error message')).toBeTruthy();
  });

  test('Has try again button in default fallback', () => {
    render(() => (
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    ));
    
    expect(screen.getByText('Try again')).toBeTruthy();
  });
});
