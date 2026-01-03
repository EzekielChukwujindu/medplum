// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Money } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export interface MoneyInputProps extends ComplexTypeInputProps<Money> {
  /** Label displayed above the input */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
}

const CURRENCY_OPTIONS = ['USD', 'EUR', 'CAD', 'GBP', 'AUD'];

/**
 * MoneyInput allows editing a FHIR Money value.
 * @param props - The component props
 */
export function MoneyInput(props: MoneyInputProps): JSX.Element {
  const [value, setValue] = createSignal<Money>(props.defaultValue || { currency: 'USD' });
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      currency: getExtendedProps(basePath + '.currency'),
      value: getExtendedProps(basePath + '.value'),
    };
  });

  function updateValue(newValue: Money): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div class="flex gap-2">
      <div class="form-control flex-1">
        {props.label && (
          <label class="label">
            <span class="label-text">{props.label}</span>
          </label>
        )}
        <div class="join">
          <span class="join-item btn btn-ghost btn-sm pointer-events-none">$</span>
          <input
            name={props.name}
            type="number"
            step="0.01"
            placeholder={props.placeholder ?? 'Value'}
            value={value().value ?? ''}
            disabled={props.disabled || fieldProps().value?.readonly}
            data-testid={(props.name ?? 'money') + '-value'}
            class="input input-bordered join-item flex-1"
            onInput={(e) => updateValue({ ...value(), value: e.currentTarget.valueAsNumber })}
          />
          <NativeSelect
            disabled={props.disabled || fieldProps().currency?.readonly}
            testId={(props.name ?? 'money') + '-currency'}
            defaultValue={value().currency ?? 'USD'}
            onChange={(v) => updateValue({ ...value(), currency: v as Money['currency'] })}
            data={CURRENCY_OPTIONS}
            class="join-item w-20"
          />
        </div>
      </div>
    </div>
  );
}
