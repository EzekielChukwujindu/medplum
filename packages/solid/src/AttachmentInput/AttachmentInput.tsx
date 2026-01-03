// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Attachment, Reference, OperationOutcome } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { AttachmentDisplay } from '../AttachmentDisplay/AttachmentDisplay';

export interface AttachmentInputProps {
  /** Input name */
  readonly name?: string;
  /** Default value */
  readonly defaultValue?: Attachment;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Security context for uploads */
  readonly securityContext?: Reference;
  /** Callback when attachment changes */
  readonly onChange?: (value: Attachment | undefined) => void;
  /** Callback when upload starts */
  readonly onUploadStart?: () => void;
  /** Callback for upload progress */
  readonly onUploadProgress?: (e: ProgressEvent) => void;
  /** Callback when upload errors */
  readonly onUploadError?: (outcome: OperationOutcome) => void;
}

/**
 * AttachmentInput allows uploading and displaying a single attachment.
 * @param props
 */
export function AttachmentInput(props: AttachmentInputProps): JSX.Element {
  const [value, setValue] = createSignal<Attachment | undefined>(props.defaultValue);

  function handleUpload(attachment: Attachment): void {
    setValue(attachment);
    if (props.onChange) {
      props.onChange(attachment);
    }
  }

  function handleRemove(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    setValue(undefined);
    if (props.onChange) {
      props.onChange(undefined);
    }
  }

  return (
    <div data-testid="attachment-input">
      <Show
        when={value()}
        fallback={
          <AttachmentButton
            disabled={props.disabled}
            securityContext={props.securityContext}
            onUpload={handleUpload}
            onUploadStart={props.onUploadStart}
            onUploadProgress={props.onUploadProgress}
            onUploadError={props.onUploadError}
          >
            Upload...
          </AttachmentButton>
        }
      >
        <div class="space-y-2">
          <AttachmentDisplay value={value()} maxWidth={200} />
          <Button
            disabled={props.disabled}
            variant="outline"
            onClick={handleRemove}
            testId="remove-attachment"
          >
            Remove
          </Button>
        </div>
      </Show>
    </div>
  );
}
