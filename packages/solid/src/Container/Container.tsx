// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface ContainerProps extends ParentProps<any> {
  /** Maximum width of the container */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Additional CSS classes */
  class?: string;
}

/**
 * Container component that centers content with max-width constraints.
 * Uses DaisyUI-compatible styling.
 * @param props
 */
export function Container(props: ContainerProps): JSX.Element {
  const maxWidthClass = (): string => {
    switch (props.maxWidth) {
      case 'sm': return 'max-w-screen-sm';
      case 'md': return 'max-w-screen-md';
      case 'lg': return 'max-w-screen-lg';
      case 'xl': return 'max-w-screen-xl';
      case '2xl': return 'max-w-screen-2xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-screen-lg';
    }
  };

  return (
    <div class={`container mx-auto px-4 ${maxWidthClass()} ${props.class ?? ''}`} {...props}>
      {props.children}
    </div>
  );
}
