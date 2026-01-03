// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Attachment } from '@medplum/fhirtypes';
import { Trash2, Upload } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { AttachmentButton } from '../AttachmentButton/AttachmentButton';
import { AttachmentDisplay } from '../AttachmentDisplay/AttachmentDisplay';

export interface AttachmentArrayInputProps {
  /** Input name */
  readonly name: string;
  /** Default attachment values */
  readonly defaultValue?: Attachment[];
  /** Callback when attachments change */
  readonly onChange?: (value: Attachment[]) => void;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Test ID */
  readonly testId?: string;
}

/**
 * AttachmentArrayInput allows uploading and managing multiple attachments.
 * @param props
 */
export function AttachmentArrayInput(props: AttachmentArrayInputProps): JSX.Element {
  const [values, setValues] = createSignal<Attachment[]>(props.defaultValue ?? []);

  function setValuesWrapper(newValues: Attachment[]): void {
    setValues(newValues);
    if (props.onChange) {
      props.onChange(newValues);
    }
  }

  function handleUpload(attachment: Attachment): void {
    setValuesWrapper([...values(), attachment]);
  }

  function handleRemove(index: number): void {
    const copy = values().slice();
    copy.splice(index, 1);
    setValuesWrapper(copy);
  }

  return (
    <div class="space-y-2" data-testid={props.testId}>
      {/* Existing attachments */}
      <For each={values()}>
        {(attachment, index) => (
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <AttachmentDisplay value={attachment} maxWidth={200} />
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-sm btn-square"
              onClick={() => handleRemove(index())}
              disabled={props.disabled}
              title="Remove"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        )}
      </For>

      {/* Add button */}
      <AttachmentButton
        disabled={props.disabled}
        onUpload={handleUpload}
      >
        <Upload class="w-4 h-4" />
        Add Attachment
      </AttachmentButton>
    </div>
  );
}
