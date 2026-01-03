// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';

export interface TextInputProps {
  /** Input name attribute */
  readonly name?: string;
  /** Label displayed above the input */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default/initial value */
  readonly defaultValue?: string;
  /** Current value (controlled) */
  readonly value?: string;
  /** Input type (text, email, password, etc.) */
  readonly type?: string;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Auto focus on mount */
  readonly autoFocus?: boolean;
  /** Error message to display */
  readonly error?: string;
  /** Change handler */
  readonly onChange?: (value: string) => void;
  /** Test ID */
  readonly testId?: string;
  /** Additional CSS classes */
  readonly class?: string;
}

/**
 * TextInput component using DaisyUI input styling.
 * Provides consistent text input with label, error state, and DaisyUI classes.
 * @param props
 */
export function TextInput(props: TextInputProps): JSX.Element {
  const handleChange = (e: InputEvent & { currentTarget: HTMLInputElement }): void => {
    if (props.onChange) {
      props.onChange(e.currentTarget.value);
    }
  };

  const inputClass = (): string => {
    const base = 'input input-bordered w-full';
    return props.error ? `${base} input-error` : base;
  };

  return (
    <div class={`form-control ${props.class ?? ''}`}>
      {props.label && (
        <label class="label" for={props.name}>
          <span class="label-text">
            {props.label}
            {props.required && <span class="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <input
        id={props.name}
        name={props.name}
        type={props.type ?? 'text'}
        placeholder={props.placeholder}
        value={props.value ?? props.defaultValue ?? ''}
        disabled={props.disabled}
        required={props.required}
        autofocus={props.autoFocus}
        data-testid={props.testId ?? props.name}
        class={inputClass()}
        onInput={handleChange}
      />
      {props.error && (
        <label class="label">
          <span class="label-text-alt text-error">{props.error}</span>
        </label>
      )}
    </div>
  );
}
