// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';

export interface SliderProps {
  /** Slider name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Current value */
  readonly value?: number;
  /** Default value */
  readonly defaultValue?: number;
  /** Minimum value */
  readonly min?: number;
  /** Maximum value */
  readonly max?: number;
  /** Step increment */
  readonly step?: number;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Show value label */
  readonly showValue?: boolean;
  /** Callback when value changes */
  readonly onChange?: (value: number) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Slider component using DaisyUI range input.
 * @param props
 */
export function Slider(props: SliderProps): JSX.Element {
  const [internalValue, setInternalValue] = createSignal(props.defaultValue ?? 50);

  const currentValue = (): number => props.value ?? internalValue();

  const handleChange = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    const newValue = Number(target.value);
    if (props.value === undefined) {
      setInternalValue(newValue);
    }
    props.onChange?.(newValue);
  };

  return (
    <div class={`form-control ${props.class ?? ''}`}>
      <div class="flex justify-between items-center mb-2">
        <Show when={props.label}>
          <label class="label-text">{props.label}</label>
        </Show>
        <Show when={props.showValue}>
          <span class="text-sm">{currentValue()}</span>
        </Show>
      </div>
      <input
        type="range"
        name={props.name}
        min={props.min ?? 0}
        max={props.max ?? 100}
        step={props.step ?? 1}
        value={currentValue()}
        disabled={props.disabled}
        class="range range-primary w-full"
        onInput={handleChange}
        data-testid={props.testId}
      />
    </div>
  );
}
