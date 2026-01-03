// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { normalizeErrorString } from '@medplum/core';
import { ErrorBoundary as SolidErrorBoundary } from 'solid-js';
import { AlertCircle } from 'lucide-solid';
import type { JSX, ParentProps } from 'solid-js';

export interface ErrorBoundaryProps extends ParentProps {
  /** Fallback to render when an error occurs. If not provided, uses default error UI. */
  fallback?: (err: Error, reset: () => void) => JSX.Element;
}

/**
 * Error display component shown when an error is caught.
 * @param props
 * @param props.error
 * @param props.reset
 */
function DefaultErrorFallback(props: { error: Error; reset: () => void }): JSX.Element {
  return (
    <div class="alert alert-error" role="alert">
      <AlertCircle class="w-5 h-5" />
      <div>
        <h3 class="font-bold">Something went wrong</h3>
        <div class="text-sm">{normalizeErrorString(props.error)}</div>
      </div>
      <button class="btn btn-sm btn-ghost" onClick={props.reset}>
        Try again
      </button>
    </div>
  );
}

/**
 * ErrorBoundary catches JavaScript errors in child components and displays a fallback UI.
 * Uses SolidJS's built-in ErrorBoundary with custom styling.
 * 
 * @param props
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary(props: ErrorBoundaryProps): JSX.Element {
  const fallback = (err: Error, reset: () => void): JSX.Element => {
    if (props.fallback) {
      return props.fallback(err, reset);
    }
    return <DefaultErrorFallback error={err} reset={reset} />;
  };

  return (
    <SolidErrorBoundary fallback={fallback}>
      {props.children}
    </SolidErrorBoundary>
  );
}
