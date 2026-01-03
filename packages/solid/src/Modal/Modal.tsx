// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Dialog as KobalteDialog } from '@kobalte/core/dialog';
import type { JSX, ParentProps } from 'solid-js';
import { Show } from 'solid-js';

export interface ModalProps extends ParentProps {
  /** Whether the modal is open */
  readonly open?: boolean;
  /** Callback when modal should close */
  readonly onClose?: () => void;
  /** Modal title */
  readonly title?: string;
  /** Whether clicking backdrop closes modal */
  readonly closeOnBackdrop?: boolean;
  /** Whether pressing Escape closes modal */
  readonly closeOnEscape?: boolean;
  /** Additional CSS class for modal box */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Modal component using Kobalte Dialog for accessibility.
 * Implements proper focus management and ARIA attributes.
 * @param props
 */
export function Modal(props: ModalProps): JSX.Element {
  const handleOpenChange = (open: boolean): void => {
    if (!open && props.onClose) {
      props.onClose();
    }
  };

  return (
    <KobalteDialog
      open={props.open}
      onOpenChange={handleOpenChange}
      modal={true}
    >
      <KobalteDialog.Portal>
        <KobalteDialog.Overlay 
          class="modal-backdrop fixed inset-0 bg-black/50 z-40"
          onClick={() => {
            if (props.closeOnBackdrop !== false && props.onClose) {
              props.onClose();
            }
          }}
        />
        <div 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          data-testid={props.testId}
        >
          <KobalteDialog.Content 
            class={`modal-box relative ${props.class ?? ''}`}
            onEscapeKeyDown={(e: KeyboardEvent) => {
              if (props.closeOnEscape === false) {
                e.preventDefault();
              }
            }}
          >
            <Show when={props.title}>
              <KobalteDialog.Title class="font-bold text-lg">
                {props.title}
              </KobalteDialog.Title>
            </Show>
            <Show when={props.onClose}>
              <KobalteDialog.CloseButton
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                aria-label="Close"
                data-testid={`${props.testId ?? 'modal'}-close`}
              >
                ✕
              </KobalteDialog.CloseButton>
            </Show>
            <div class="py-4">
              {props.children}
            </div>
          </KobalteDialog.Content>
        </div>
      </KobalteDialog.Portal>
    </KobalteDialog>
  );
}

export interface ModalActionsProps extends ParentProps {
  /** Additional CSS class */
  readonly class?: string;
}

/**
 * ModalActions provides a container for modal action buttons.
 * @param props
 */
export function ModalActions(props: ModalActionsProps): JSX.Element {
  return (
    <div class={`modal-action ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}

// Export primitive for advanced use cases
export { KobalteDialog as ModalPrimitive };
