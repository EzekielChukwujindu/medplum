// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Range } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { QuantityInput } from '../QuantityInput/QuantityInput';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type RangeInputProps = ComplexTypeInputProps<Range>;

/**
 * RangeInput allows editing a FHIR Range (low and high Quantity).
 * @param props - The component props
 */
export function RangeInput(props: RangeInputProps): JSX.Element {
  const [value, setValue] = createSignal<Range>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      low: getExtendedProps(basePath + '.low'),
      high: getExtendedProps(basePath + '.high'),
    };
  });

  function updateValue(newValue: Range): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div class="flex flex-wrap gap-2">
      <div class="flex-1">
        <label class="label">
          <span class="label-text">Low</span>
        </label>
        <QuantityInput
          disabled={props.disabled || fieldProps().low?.readonly}
          name={(props.name ?? 'range') + '-low'}
          path={(props.path ?? '') + '.low'}
          defaultValue={value().low}
          onChange={(v) => updateValue({ ...value(), low: v })}
        />
      </div>
      <div class="flex-1">
        <label class="label">
          <span class="label-text">High</span>
        </label>
        <QuantityInput
          disabled={props.disabled || fieldProps().high?.readonly}
          name={(props.name ?? 'range') + '-high'}
          path={(props.path ?? '') + '.high'}
          defaultValue={value().high}
          onChange={(v) => updateValue({ ...value(), high: v })}
        />
      </div>
    </div>
  );
}
