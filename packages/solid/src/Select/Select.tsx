// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Select as KobalteSelect } from '@kobalte/core/select';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  /** Select name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Options array */
  readonly options: SelectOption[];
  /** Current value */
  readonly value?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Whether required */
  readonly required?: boolean;
  /** Error message */
  readonly error?: string;
  /** Callback when value changes */
  readonly onChange?: (value: string) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Select component using Kobalte for accessibility.
 * Provides proper keyboard navigation and screen reader support.
 * @param props
 */
export function Select(props: SelectProps): JSX.Element {
  return (
    <KobalteSelect
      options={props.options}
      optionValue="value"
      optionTextValue="label"
      optionDisabled="disabled"
      value={props.options.find((o) => o.value === props.value)}
      onChange={(option) => option && props.onChange?.(option.value)}
      placeholder={props.placeholder}
      disabled={props.disabled}
      itemComponent={(itemProps) => (
        <KobalteSelect.Item item={itemProps.item} class="select-option p-2 hover:bg-base-200 cursor-pointer">
          <KobalteSelect.ItemLabel>{itemProps.item.rawValue.label}</KobalteSelect.ItemLabel>
        </KobalteSelect.Item>
      )}
    >
      <div class={`form-control ${props.class ?? ''}`}>
        <Show when={props.label}>
          <KobalteSelect.Label class="label">
            <span class="label-text">
              {props.label}
              {props.required && <span class="text-error ml-1">*</span>}
            </span>
          </KobalteSelect.Label>
        </Show>
        <KobalteSelect.Trigger
          class={`select select-bordered w-full ${props.error ? 'select-error' : ''}`}
          data-testid={props.testId}
        >
          <KobalteSelect.Value<SelectOption>>
            {(state) => state.selectedOption()?.label ?? props.placeholder ?? 'Select...'}
          </KobalteSelect.Value>
          <KobalteSelect.Icon class="ml-auto">▼</KobalteSelect.Icon>
        </KobalteSelect.Trigger>
        <Show when={props.error}>
          <KobalteSelect.ErrorMessage class="label">
            <span class="label-text-alt text-error">{props.error}</span>
          </KobalteSelect.ErrorMessage>
        </Show>
      </div>
      <KobalteSelect.Portal>
        <KobalteSelect.Content class="bg-base-100 rounded-box shadow-lg z-50 p-2">
          <KobalteSelect.Listbox class="menu" />
        </KobalteSelect.Content>
      </KobalteSelect.Portal>
    </KobalteSelect>
  );
}
