// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export type ProgressVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressProps {
  /** Current value (0-100 or custom max) */
  readonly value?: number;
  /** Maximum value */
  readonly max?: number;
  /** Progress variant/color */
  readonly variant?: ProgressVariant;
  /** Show percentage label */
  readonly showLabel?: boolean;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Progress bar component using DaisyUI styling.
 * @param props
 */
export function Progress(props: ProgressProps): JSX.Element {
  const max = props.max ?? 100;
  const value = props.value ?? 0;
  const percentage = Math.round((value / max) * 100);

  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'progress-primary';
      case 'secondary': return 'progress-secondary';
      case 'accent': return 'progress-accent';
      case 'success': return 'progress-success';
      case 'warning': return 'progress-warning';
      case 'error': return 'progress-error';
      case 'info': return 'progress-info';
      default: return '';
    }
  };

  return (
    <div class={`flex items-center gap-2 ${props.class ?? ''}`} data-testid={props.testId}>
      <progress
        class={`progress ${variantClass()}`}
        value={value}
        max={max}
      />
      <Show when={props.showLabel}>
        <span class="text-sm">{percentage}%</span>
      </Show>
    </div>
  );
}

export interface RadialProgressProps {
  /** Value (0-100) */
  readonly value: number;
  /** Size of the radial progress */
  readonly size?: 'sm' | 'md' | 'lg';
  /** Radial progress variant/color */
  readonly variant?: ProgressVariant;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * RadialProgress component - circular progress indicator.
 * @param props
 */
export function RadialProgress(props: RadialProgressProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'sm': return 'w-12 h-12';
      case 'lg': return 'w-24 h-24';
      default: return 'w-16 h-16';
    }
  };

  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'accent': return 'text-accent';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'info': return 'text-info';
      default: return '';
    }
  };

  return (
    <div
      class={`radial-progress ${variantClass()} ${sizeClass()} ${props.class ?? ''}`}
      style={{ "--value": props.value } as any}
      role="progressbar"
      data-testid={props.testId}
    >
      {props.value}%
    </div>
  );
}
