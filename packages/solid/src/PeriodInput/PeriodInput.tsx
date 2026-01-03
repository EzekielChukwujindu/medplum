// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Period } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { DateTimeInput } from '../DateTimeInput/DateTimeInput';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type PeriodInputProps = ComplexTypeInputProps<Period>;

/**
 * PeriodInput allows editing a FHIR Period (start and end datetime).
 * @param props - The component props
 */
export function PeriodInput(props: PeriodInputProps): JSX.Element {
  const [value, setValue] = createSignal<Period>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      start: getExtendedProps(basePath + '.start'),
      end: getExtendedProps(basePath + '.end'),
    };
  });

  function updateValue(newValue: Period): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div class="flex flex-wrap gap-2">
      <div class="flex-1 min-w-40">
        <DateTimeInput
          disabled={props.disabled || fieldProps().start?.readonly}
          name={(props.name ?? 'period') + '-start'}
          label="Start"
          testId={(props.name ?? 'period') + '-start'}
          defaultValue={value().start}
          onChange={(v) => updateValue({ ...value(), start: v || undefined })}
        />
      </div>
      <div class="flex-1 min-w-40">
        <DateTimeInput
          disabled={props.disabled || fieldProps().end?.readonly}
          name={(props.name ?? 'period') + '-end'}
          label="End"
          testId={(props.name ?? 'period') + '-end'}
          defaultValue={value().end}
          onChange={(v) => updateValue({ ...value(), end: v || undefined })}
        />
      </div>
    </div>
  );
}
