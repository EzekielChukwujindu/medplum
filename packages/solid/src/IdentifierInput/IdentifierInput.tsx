// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Identifier } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import { getErrorsForInput } from '../utils/outcomes';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type IdentifierInputProps = ComplexTypeInputProps<Identifier>;

/**
 * IdentifierInput allows editing a FHIR Identifier.
 * @param props - The component props
 */
export function IdentifierInput(props: IdentifierInputProps): JSX.Element {
  const [value, setValue] = createSignal<Identifier>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      system: getExtendedProps(basePath + '.system'),
      value: getExtendedProps(basePath + '.value'),
    };
  });

  function updateValue(newValue: Identifier): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  const errorPath = props.valuePath ?? props.path ?? '';

  return (
    <div class="flex flex-wrap gap-2">
      <TextInput
        disabled={props.disabled || fieldProps().system?.readonly}
        placeholder="System"
        testId={(props.name ?? 'identifier') + '-system'}
        defaultValue={value().system}
        onChange={(v) => updateValue({ ...value(), system: v || undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.system')}
        class="flex-1 min-w-40"
      />
      <TextInput
        disabled={props.disabled || fieldProps().value?.readonly}
        placeholder="Value"
        testId={(props.name ?? 'identifier') + '-value'}
        defaultValue={value().value}
        onChange={(v) => updateValue({ ...value(), value: v || undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.value')}
        class="flex-1 min-w-40"
      />
    </div>
  );
}
