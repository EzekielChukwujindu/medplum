// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { OperationOutcome } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { getErrorsForInput } from '../utils/outcomes';
import { convertIsoToLocal, convertLocalToIso } from './DateTimeInput.utils';

export interface DateTimeInputProps {
  /** Input name attribute */
  readonly name?: string;
  /** Label displayed above the input */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default value in ISO-8601 format */
  readonly defaultValue?: string;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Auto focus on mount */
  readonly autoFocus?: boolean;
  /** OperationOutcome for error display */
  readonly outcome?: OperationOutcome;
  /** Change handler (returns ISO-8601 string) */
  readonly onChange?: (value: string) => void;
  /** Test ID */
  readonly testId?: string;
}

/**
 * DateTimeInput component wraps HTML5 datetime-local input.
 * Handles timezone conversion between ISO-8601 and local datetime strings.
 * @param props
 */
export function DateTimeInput(props: DateTimeInputProps): JSX.Element {
  const error = (): string | undefined => getErrorsForInput(props.outcome, props.name);

  const handleChange = (e: InputEvent & { currentTarget: HTMLInputElement }): void => {
    if (props.onChange) {
      const newValue = e.currentTarget.value;
      props.onChange(convertLocalToIso(newValue));
    }
  };

  const inputType = (): string => {
    // Use datetime-local for browser, but handle JSDOM test environments
    // where datetime-local is not properly supported
    if (typeof window !== 'undefined' && typeof (window as unknown as { vi?: unknown }).vi !== 'undefined') {
      return 'text';
    }
    return 'datetime-local';
  };

  const inputClass = (): string => {
    const base = 'input input-bordered w-full';
    return error() ? `${base} input-error` : base;
  };

  return (
    <div class="form-control">
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
        type={inputType()}
        step={1}
        placeholder={props.placeholder}
        value={convertIsoToLocal(props.defaultValue)}
        disabled={props.disabled}
        required={props.required}
        autofocus={props.autoFocus}
        data-testid={props.testId ?? props.name}
        class={inputClass()}
        onInput={handleChange}
      />
      {error() && (
        <label class="label">
          <span class="label-text-alt text-error">{error()}</span>
        </label>
      )}
    </div>
  );
}
