// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface DividerProps {
  /** Divider text/label */
  readonly label?: string;
  /** Orientation */
  readonly orientation?: 'horizontal' | 'vertical';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Divider component using DaisyUI styling.
 * @param props
 */
export function Divider(props: DividerProps): JSX.Element {
  const orientationClass = props.orientation === 'vertical' ? 'divider-horizontal' : '';

  return (
    <div
      class={`divider ${orientationClass} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      {props.label}
    </div>
  );
}

export interface KbdProps extends ParentProps {
  /** Size variant */
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  readonly class?: string;
}

/**
 * Kbd (keyboard key) component using DaisyUI styling.
 * @param props
 */
export function Kbd(props: KbdProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'kbd-xs';
      case 'sm': return 'kbd-sm';
      case 'lg': return 'kbd-lg';
      default: return '';
    }
  };

  return (
    <kbd class={`kbd ${sizeClass()} ${props.class ?? ''}`}>
      {props.children}
    </kbd>
  );
}
