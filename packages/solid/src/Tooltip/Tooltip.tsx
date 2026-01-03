// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';
import { splitProps } from 'solid-js';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends ParentProps {
  /** Tooltip text */
  readonly label: string;
  /** Position of tooltip */
  readonly position?: TooltipPosition;
  /** Additional CSS class */
  readonly class?: string;
  /** Whether tooltip is disabled */
  readonly disabled?: boolean;
}

/**
 * Tooltip component using DaisyUI styling.
 * Wraps content and shows label on hover.
 * @param props
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const [local] = splitProps(props, [
    'label',
    'position',
    'class',
    'disabled',
    'children',
  ]);

  if (local.disabled) {
    return <>{local.children}</>;
  }

  const positionClass = (): string => {
    switch (local.position) {
      case 'bottom': return 'tooltip-bottom';
      case 'left': return 'tooltip-left';
      case 'right': return 'tooltip-right';
      default: return 'tooltip-top';
    }
  };

  return (
    <div
      class={`tooltip ${positionClass()} ${local.class ?? ''}`}
      data-tip={local.label}
    >
      {local.children}
    </div>
  );
}
