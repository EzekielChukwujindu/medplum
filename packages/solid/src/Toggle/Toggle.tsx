// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export interface ToggleProps {
  /** Input name */
  readonly name?: string;
  /** Toggle label */
  readonly label?: string;
  /** Label position */
  readonly labelPosition?: 'left' | 'right';
  /** Whether checked */
  readonly checked?: boolean;
  /** Default checked state */
  readonly defaultChecked?: boolean;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Toggle size */
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Toggle color variant */
  readonly variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  /** Callback when changed */
  readonly onChange?: (checked: boolean) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Toggle (switch) component using DaisyUI styling.
 * @param props
 */
export function Toggle(props: ToggleProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'toggle-xs';
      case 'sm': return 'toggle-sm';
      case 'lg': return 'toggle-lg';
      default: return '';
    }
  };

  const variantClass = (): string => {
    switch (props.variant) {
      case 'primary': return 'toggle-primary';
      case 'secondary': return 'toggle-secondary';
      case 'accent': return 'toggle-accent';
      case 'success': return 'toggle-success';
      case 'warning': return 'toggle-warning';
      case 'error': return 'toggle-error';
      case 'info': return 'toggle-info';
      default: return '';
    }
  };

  const handleChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    props.onChange?.(target.checked);
  };

  const labelEl = props.label ? <span class="label-text">{props.label}</span> : null;

  return (
    <label class={`flex items-center gap-2 cursor-pointer ${props.class ?? ''}`}>
      <Show when={props.labelPosition === 'left' && props.label}>
        {labelEl}
      </Show>
      <input
        type="checkbox"
        name={props.name}
        checked={props.checked}
        disabled={props.disabled}
        class={`toggle ${sizeClass()} ${variantClass()}`}
        onChange={handleChange}
        data-testid={props.testId}
      />
      <Show when={props.labelPosition !== 'left' && props.label}>
        {labelEl}
      </Show>
    </label>
  );
}
