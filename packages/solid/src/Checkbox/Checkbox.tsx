// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export interface CheckboxProps {
  /** Input name */
  readonly name?: string;
  /** Checkbox label */
  readonly label?: string;
  /** Whether checked */
  readonly checked?: boolean;
  /** Default checked state */
  readonly defaultChecked?: boolean;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Checkbox size */
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Checkbox color variant */
  readonly variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  /** Callback when changed */
  readonly onChange?: (checked: boolean) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Checkbox component using DaisyUI styling.
 * @param props
 */
export function Checkbox(props: CheckboxProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'checkbox-xs';
      case 'sm': return 'checkbox-sm';
      case 'lg': return 'checkbox-lg';
      default: return '';
    }
  };

  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'checkbox-primary';
      case 'secondary': return 'checkbox-secondary';
      case 'accent': return 'checkbox-accent';
      case 'success': return 'checkbox-success';
      case 'warning': return 'checkbox-warning';
      case 'error': return 'checkbox-error';
      case 'info': return 'checkbox-info';
      default: return '';
    }
  };

  const handleChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    props.onChange?.(target.checked);
  };

  return (
    <label class={`flex items-center gap-2 cursor-pointer ${props.class ?? ''}`}>
      <input
        type="checkbox"
        name={props.name}
        checked={props.checked}
        disabled={props.disabled}
        class={`checkbox ${sizeClass()} ${variantClass()}`}
        onChange={handleChange}
        data-testid={props.testId}
      />
      <Show when={props.label}>
        <span class="label-text">{props.label}</span>
      </Show>
    </label>
  );
}

export interface RadioProps {
  /** Input name */
  readonly name: string;
  /** Radio value */
  readonly value: string;
  /** Radio label */
  readonly label?: string;
  /** Whether checked */
  readonly checked?: boolean;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Radio size */
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Radio color variant */
  readonly variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  /** Callback when changed */
  readonly onChange?: (value: string) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Radio component using DaisyUI styling.
 * @param props
 */
export function Radio(props: RadioProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'radio-xs';
      case 'sm': return 'radio-sm';
      case 'lg': return 'radio-lg';
      default: return '';
    }
  };

  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'radio-primary';
      case 'secondary': return 'radio-secondary';
      case 'accent': return 'radio-accent';
      case 'success': return 'radio-success';
      case 'warning': return 'radio-warning';
      case 'error': return 'radio-error';
      case 'info': return 'radio-info';
      default: return '';
    }
  };

  const handleChange = (): void => {
    props.onChange?.(props.value);
  };

  return (
    <label class={`flex items-center gap-2 cursor-pointer ${props.class ?? ''}`}>
      <input
        type="radio"
        name={props.name}
        value={props.value}
        checked={props.checked}
        disabled={props.disabled}
        class={`radio ${sizeClass()} ${variantClass()}`}
        onChange={handleChange}
        data-testid={props.testId}
      />
      <Show when={props.label}>
        <span class="label-text">{props.label}</span>
      </Show>
    </label>
  );
}
