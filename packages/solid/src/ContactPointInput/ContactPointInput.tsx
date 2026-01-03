// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ContactPoint } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import { getErrorsForInput } from '../utils/outcomes';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type ContactPointInputProps = ComplexTypeInputProps<ContactPoint>;

const SYSTEM_OPTIONS = ['', 'phone', 'fax', 'email', 'pager', 'url', 'sms', 'other'];
const USE_OPTIONS = ['', 'home', 'work', 'temp', 'old', 'mobile'];

/**
 * ContactPointInput allows editing a FHIR ContactPoint.
 * @param props - The component props
 */
export function ContactPointInput(props: ContactPointInputProps): JSX.Element {
  const [value, setValue] = createSignal<ContactPoint>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      system: getExtendedProps(basePath + '.system'),
      use: getExtendedProps(basePath + '.use'),
      value: getExtendedProps(basePath + '.value'),
    };
  });

  function updateValue(newValue: ContactPoint): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  const errorPath = props.valuePath ?? props.path ?? '';

  return (
    <div class="flex flex-wrap gap-2">
      <NativeSelect
        disabled={props.disabled || fieldProps().system?.readonly}
        testId="contact-system"
        defaultValue={value().system}
        onChange={(v) => updateValue({ ...value(), system: v as ContactPoint['system'] || undefined })}
        data={SYSTEM_OPTIONS}
        error={getErrorsForInput(props.outcome, errorPath + '.system')}
        class="w-24"
      />
      <NativeSelect
        disabled={props.disabled || fieldProps().use?.readonly}
        testId="contact-use"
        defaultValue={value().use}
        onChange={(v) => updateValue({ ...value(), use: v as ContactPoint['use'] || undefined })}
        data={USE_OPTIONS}
        error={getErrorsForInput(props.outcome, errorPath + '.use')}
        class="w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().value?.readonly}
        placeholder="Value"
        name={(props.name ?? '') + '-value'}
        defaultValue={value().value}
        onChange={(v) => updateValue({ ...value(), value: v || undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.value')}
        class="flex-1 min-w-40"
      />
    </div>
  );
}
