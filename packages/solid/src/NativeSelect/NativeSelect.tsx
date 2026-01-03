// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For } from 'solid-js';

export interface NativeSelectProps {
  /** Select name attribute */
  readonly name?: string;
  /** Label displayed above the select */
  readonly label?: string;
  /** Default selected value */
  readonly defaultValue?: string;
  /** Current value (controlled) */
  readonly value?: string;
  /** Options data - array of strings or { label, value } objects */
  readonly data: readonly (string | { label: string; value: string })[];
  /** Whether select is disabled */
  readonly disabled?: boolean;
  /** Whether select is required */
  readonly required?: boolean;
  /** Change handler */
  readonly onChange?: (value: string) => void;
  /** Error message */
  readonly error?: string;
  /** Test ID */
  readonly testId?: string;
  /** Additional CSS classes */
  readonly class?: string;
}

/**
 * NativeSelect component using DaisyUI select styling.
 * Provides a styled native HTML select element.
 * @param props
 */
export function NativeSelect(props: NativeSelectProps): JSX.Element {
  const handleChange = (e: Event & { currentTarget: HTMLSelectElement }): void => {
    if (props.onChange) {
      props.onChange(e.currentTarget.value);
    }
  };

  const selectClass = (): string => {
    const base = 'select select-bordered';
    return props.error ? `${base} select-error` : base;
  };

  const getOptionValue = (item: string | { label: string; value: string }): string => {
    return typeof item === 'string' ? item : item.value;
  };

  const getOptionLabel = (item: string | { label: string; value: string }): string => {
    return typeof item === 'string' ? item : item.label;
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
      <select
        id={props.name}
        name={props.name}
        value={props.value ?? props.defaultValue ?? ''}
        disabled={props.disabled}
        required={props.required}
        data-testid={props.testId}
        class={selectClass()}
        onChange={handleChange}
      >
        <For each={props.data}>
          {(item) => (
            <option value={getOptionValue(item)}>
              {getOptionLabel(item)}
            </option>
          )}
        </For>
      </select>
      {props.error && (
        <label class="label">
          <span class="label-text-alt text-error">{props.error}</span>
        </label>
      )}
    </div>
  );
}
