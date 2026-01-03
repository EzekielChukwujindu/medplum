// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'ghost' | 'outline';
export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

export interface BadgeProps extends ParentProps {
  /** Badge variant/color */
  readonly variant?: BadgeVariant;
  /** Badge size */
  readonly size?: BadgeSize;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Badge component using DaisyUI styling.
 * For displaying small status indicators or labels.
 * @param props
 */
export function Badge(props: BadgeProps): JSX.Element {
  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'badge-primary';
      case 'secondary': return 'badge-secondary';
      case 'accent': return 'badge-accent';
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'error': return 'badge-error';
      case 'info': return 'badge-info';
      case 'ghost': return 'badge-ghost';
      case 'outline': return 'badge-outline';
      default: return '';
    }
  };

  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'badge-xs';
      case 'sm': return 'badge-sm';
      case 'lg': return 'badge-lg';
      default: return '';
    }
  };

  return (
    <span
      class={`badge ${variantClass()} ${sizeClass()} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      {props.children}
    </span>
  );
}
