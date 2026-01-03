// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Button as KobalteButton } from '@kobalte/core/button';
import type { JSX, ParentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'link' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends ParentProps {
  /** Button variant. Defaults to 'primary'. */
  variant?: ButtonVariant;
  /** Button size. Defaults to 'md'. */
  size?: ButtonSize;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Button type. Defaults to 'button'. */
  type?: 'button' | 'submit' | 'reset';
  /** Click handler */
  onClick?: (e: MouseEvent) => void;
  /** Additional CSS classes */
  class?: string;
  /** Accessibility label */
  'aria-label'?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Button component using Kobalte for accessibility and DaisyUI for styling.
 * 
 * @param props
 * @example
 * ```tsx
 * <Button variant="primary" onClick={() => console.log('clicked')}>
 *   Click me
 * </Button>
 * ```
 */
export function Button(props: ButtonProps): JSX.Element {
  const [local, others] = splitProps(props, [
    'variant',
    'size',
    'disabled',
    'loading',
    'type',
    'onClick',
    'class',
    'children',
    'testId',
  ]);

  const variantClass = (): string => {
    switch (local.variant) {
      case 'secondary': return 'btn-secondary';
      case 'accent': return 'btn-accent';
      case 'ghost': return 'btn-ghost';
      case 'link': return 'btn-link';
      case 'outline': return 'btn-outline';
      default: return 'btn-primary';
    }
  };

  const sizeClass = (): string => {
    switch (local.size) {
      case 'xs': return 'btn-xs';
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };

  const isDisabled = (): boolean => !!local.disabled || !!local.loading;

  return (
    <KobalteButton
      type={local.type ?? 'button'}
      disabled={isDisabled()}
      onClick={local.onClick}
      class={`btn ${variantClass()} ${sizeClass()} ${local.class ?? ''}`}
      data-testid={local.testId}
      {...others}
    >
      {local.loading && <span class="loading loading-spinner loading-sm" />}
      {local.children}
    </KobalteButton>
  );
}
