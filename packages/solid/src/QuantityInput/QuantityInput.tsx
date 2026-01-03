// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Quantity } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export interface QuantityInputProps extends ComplexTypeInputProps<Quantity> {
  /** Auto focus on mount */
  readonly autoFocus?: boolean;
  /** Whether input is required */
  readonly required?: boolean;
  /** Disable mouse wheel changes on number input */
  readonly disableWheel?: boolean;
}

const COMPARATOR_OPTIONS = ['', '<', '<=', '>=', '>'];

/**
 * QuantityInput allows editing a FHIR Quantity.
 * @param props - The component props
 */
export function QuantityInput(props: QuantityInputProps): JSX.Element {
  const [value, setValue] = createSignal<Quantity>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      comparator: getExtendedProps(basePath + '.comparator'),
      value: getExtendedProps(basePath + '.value'),
      unit: getExtendedProps(basePath + '.unit'),
    };
  });

  function updateValue(newValue: Quantity): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function tryParseNumber(str: string): number | undefined {
    if (!str) {
      return undefined;
    }
    return Number.parseFloat(str);
  }

  const handleWheel = (e: WheelEvent): void => {
    if (props.disableWheel) {
      (e.currentTarget as HTMLInputElement).blur();
    }
  };

  return (
    <div class="flex flex-wrap gap-2">
      <NativeSelect
        disabled={props.disabled || fieldProps().comparator?.readonly}
        testId={(props.name ?? 'quantity') + '-comparator'}
        defaultValue={value().comparator}
        onChange={(v) => updateValue({ ...value(), comparator: v as Quantity['comparator'] || undefined })}
        data={COMPARATOR_OPTIONS}
        class="w-16"
      />
      <div class="form-control flex-1 min-w-24">
        <input
          id={props.name}
          name={props.name}
          type="number"
          placeholder="Value"
          value={value().value ?? ''}
          disabled={props.disabled || fieldProps().value?.readonly}
          required={props.required}
          autofocus={props.autoFocus}
          step="any"
          data-testid={(props.name ?? 'quantity') + '-value'}
          class="input input-bordered w-full"
          onWheel={handleWheel}
          onInput={(e) => updateValue({ ...value(), value: tryParseNumber(e.currentTarget.value) })}
        />
      </div>
      <TextInput
        disabled={props.disabled || fieldProps().unit?.readonly}
        placeholder="Unit"
        testId={(props.name ?? 'quantity') + '-unit'}
        defaultValue={value().unit}
        onChange={(v) => updateValue({ ...value(), unit: v || undefined })}
        class="flex-1 min-w-20"
      />
    </div>
  );
}
