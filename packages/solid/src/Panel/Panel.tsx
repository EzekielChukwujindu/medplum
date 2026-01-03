// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface PanelProps extends ParentProps {
  /** Maximum width in pixels */
  width?: number;
  /** Whether to fill available space */
  fill?: boolean;
  /** Additional CSS classes */
  class?: string;
}

/**
 * Panel component - a card-like container with border and shadow.
 * Uses DaisyUI card styling.
 * @param props
 */
export function Panel(props: PanelProps): JSX.Element {
  const style = (): Record<string, string> | undefined => {
    if (props.width) {
      return { 'max-width': `${props.width}px` };
    }
    return undefined;
  };

  const fillClass = (): string => props.fill ? 'flex-1' : '';

  return (
    <div
      class={`card bg-base-100 shadow-sm border border-base-300 p-4 ${fillClass()} ${props.class ?? ''}`}
      style={style()}
    >
      {props.children}
    </div>
  );
}
