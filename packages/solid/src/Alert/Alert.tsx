// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';
import { Show } from 'solid-js';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends ParentProps {
  /** Alert type/severity */
  readonly type?: AlertType;
  /** Alert title */
  readonly title?: string;
  /** Whether alert can be dismissed */
  readonly dismissible?: boolean;
  /** Callback when dismissed */
  readonly onDismiss?: () => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Alert component using DaisyUI styling.
 * Displays info, success, warning, or error messages.
 * @param props
 */
export function Alert(props: AlertProps): JSX.Element {
  const typeClass = (): string => {
    switch (props.type) {
      case 'success': return 'alert-success';
      case 'warning': return 'alert-warning';
      case 'error': return 'alert-error';
      default: return 'alert-info';
    }
  };

  const icon = (): string => {
    switch (props.type) {
      case 'success': return '✓';
      case 'warning': return '⚠';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  return (
    <div
      role="alert"
      class={`alert ${typeClass()} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <span class="text-lg">{icon()}</span>
      <div class="flex-1">
        <Show when={props.title}>
          <h3 class="font-bold">{props.title}</h3>
        </Show>
        <div>{props.children}</div>
      </div>
      <Show when={props.dismissible && props.onDismiss}>
        <button
          type="button"
          class="btn btn-sm btn-ghost"
          onClick={props.onDismiss}
          aria-label="Dismiss"
          data-testid={`${props.testId ?? 'alert'}-dismiss`}
        >
          ✕
        </button>
      </Show>
    </div>
  );
}
