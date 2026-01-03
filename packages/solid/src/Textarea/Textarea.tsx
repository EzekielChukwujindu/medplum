// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show, splitProps } from 'solid-js';

export interface TextareaProps {
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Current value */
  readonly value?: string;
  /** Default value */
  readonly defaultValue?: string;
  /** Number of rows */
  readonly rows?: number;
  /** Whether textarea is disabled */
  readonly disabled?: boolean;
  /** Whether textarea is required */
  readonly required?: boolean;
  /** Whether textarea is read-only */
  readonly readonly?: boolean;
  /** Error message */
  readonly error?: string;
  /** Helper text */
  readonly helperText?: string;
  /** Callback when value changes */
  readonly onChange?: (value: string) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Textarea component using DaisyUI styling.
 * @param props
 */
export function Textarea(props: TextareaProps): JSX.Element {
  const [local] = splitProps(props, [
    'name',
    'label',
    'placeholder',
    'value',
    'defaultValue',
    'rows',
    'disabled',
    'required',
    'readonly',
    'error',
    'helperText',
    'onChange',
    'class',
    'testId',
  ]);

  const handleInput = (e: InputEvent): void => {
    const target = e.target as HTMLTextAreaElement;
    local.onChange?.(target.value);
  };

  return (
    <div class={`form-control ${local.class ?? ''}`}>
      <Show when={local.label}>
        <label class="label">
          <span class="label-text">
            {local.label}
            {local.required && <span class="text-error ml-1">*</span>}
          </span>
        </label>
      </Show>
      <textarea
        name={local.name}
        placeholder={local.placeholder}
        value={local.value}
        rows={local.rows ?? 3}
        disabled={local.disabled}
        required={local.required}
        readonly={local.readonly}
        class={`textarea textarea-bordered w-full ${local.error ? 'textarea-error' : ''}`}
        onInput={handleInput}
        data-testid={local.testId}
      >
        {local.defaultValue}
      </textarea>
      <Show when={local.error || local.helperText}>
        <label class="label">
          <span class={`label-text-alt ${local.error ? 'text-error' : ''}`}>
            {local.error ?? local.helperText}
          </span>
        </label>
      </Show>
    </div>
  );
}
