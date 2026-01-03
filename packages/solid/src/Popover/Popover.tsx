// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Popover as KobaltePopover } from '@kobalte/core/popover';
import type { JSX, ParentProps } from 'solid-js';

export interface PopoverProps extends ParentProps {
  /** Trigger element */
  readonly trigger: JSX.Element;
  /** Popover placement */
  readonly placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Test ID */
  readonly testId?: string;
}

/**
 * Popover component using Kobalte for accessibility.
 * @param props
 */
export function Popover(props: PopoverProps): JSX.Element {
  return (
    <KobaltePopover placement={props.placement}>
      <KobaltePopover.Trigger class="btn" data-testid={`${props.testId ?? 'popover'}-trigger`}>
        {props.trigger}
      </KobaltePopover.Trigger>
      <KobaltePopover.Portal>
        <KobaltePopover.Content
          class="bg-base-100 rounded-box shadow-lg p-4 z-50"
          data-testid={props.testId}
        >
          <KobaltePopover.Arrow />
          {props.children}
        </KobaltePopover.Content>
      </KobaltePopover.Portal>
    </KobaltePopover>
  );
}
