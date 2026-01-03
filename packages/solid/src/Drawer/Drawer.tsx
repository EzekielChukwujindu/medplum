// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';
import { Show } from 'solid-js';

export interface DrawerProps extends ParentProps {
  /** Whether drawer is open */
  readonly open?: boolean;
  /** Callback when open state changes */
  readonly onClose?: () => void;
  /** Drawer position */
  readonly position?: 'left' | 'right';
  /** Drawer width (CSS value) */
  readonly width?: string;
  /** Show overlay */
  readonly overlay?: boolean;
  /** Drawer ID for checkbox-based toggle */
  readonly id?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Drawer (sidebar) component using DaisyUI styling.
 * @param props
 */
export function Drawer(props: DrawerProps): JSX.Element {
  const drawerId = props.id ?? 'drawer';
  const positionClass = props.position === 'right' ? 'drawer-end' : '';
  const width = props.width ?? '320px';

  return (
    <div class={`drawer ${positionClass}`} data-testid={props.testId}>
      <input
        id={drawerId}
        type="checkbox"
        class="drawer-toggle"
        checked={props.open}
        onChange={() => props.onClose?.()}
      />
      <div class="drawer-content">
        {/* Page content here */}
      </div>
      <div class="drawer-side z-50">
        <Show when={props.overlay !== false}>
          <label
            for={drawerId}
            class="drawer-overlay"
            aria-label="close sidebar"
            onClick={props.onClose}
          />
        </Show>
        <div
          class="min-h-full bg-base-200 p-4"
          style={{ width }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
}
