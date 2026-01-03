// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import type { JSX, ParentProps } from 'solid-js';
import { Show } from 'solid-js';

export interface DialogProps extends ParentProps {
  /** Whether dialog is open */
  readonly open?: boolean;
  /** Callback when open state changes */
  readonly onOpenChange?: (open: boolean) => void;
  /** Dialog title */
  readonly title?: string;
  /** Dialog description */
  readonly description?: string;
  /** Whether to close on escape */
  readonly closeOnEscape?: boolean;
  /** Additional CSS class for content */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Dialog component using Kobalte for accessibility.
 * Implements proper focus management and ARIA attributes.
 * @param props
 */
export function Dialog(props: DialogProps): JSX.Element {
  return (
    <KobalteDialog open={props.open} onOpenChange={props.onOpenChange}>
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay class="fixed inset-0 bg-black/50 z-40" />
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" data-testid={props.testId}>
          <KobalteDialog.Content class={`modal-box ${props.class ?? ''}`}>
            <Show when={props.title}>
              <KobalteDialog.Title class="font-bold text-lg">{props.title}</KobalteDialog.Title>
            </Show>
            <Show when={props.description}>
              <KobalteDialog.Description class="text-base-content/70">
                {props.description}
              </KobalteDialog.Description>
            </Show>
            <KobalteDialog.CloseButton class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </KobalteDialog.CloseButton>
            <div class="py-4">{props.children}</div>
          </KobalteDialog.Content>
        </div>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
}

export { KobalteDialog as DialogPrimitive };
