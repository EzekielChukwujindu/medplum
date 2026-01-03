// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Ratio } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { QuantityInput } from '../QuantityInput/QuantityInput';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type RatioInputProps = ComplexTypeInputProps<Ratio>;

/**
 * RatioInput allows editing a FHIR Ratio (numerator and denominator Quantity).
 * @param props - The component props
 */
export function RatioInput(props: RatioInputProps): JSX.Element {
  const [value, setValue] = createSignal<Ratio>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      numerator: getExtendedProps(basePath + '.numerator'),
      denominator: getExtendedProps(basePath + '.denominator'),
    };
  });

  function updateValue(newValue: Ratio): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div class="flex items-end gap-2">
      <div class="flex-1">
        <label class="label">
          <span class="label-text">Numerator</span>
        </label>
        <QuantityInput
          disabled={props.disabled || fieldProps().numerator?.readonly}
          name={(props.name ?? 'ratio') + '-num'}
          path={(props.path ?? '') + '.numerator'}
          defaultValue={value().numerator}
          onChange={(v) => updateValue({ ...value(), numerator: v })}
        />
      </div>
      <span class="mb-3 text-lg">/</span>
      <div class="flex-1">
        <label class="label">
          <span class="label-text">Denominator</span>
        </label>
        <QuantityInput
          disabled={props.disabled || fieldProps().denominator?.readonly}
          name={(props.name ?? 'ratio') + '-denom'}
          path={(props.path ?? '') + '.denominator'}
          defaultValue={value().denominator}
          onChange={(v) => updateValue({ ...value(), denominator: v })}
        />
      </div>
    </div>
  );
}
