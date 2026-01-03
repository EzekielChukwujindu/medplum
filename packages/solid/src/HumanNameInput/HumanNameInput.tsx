// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { HumanName } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import { getErrorsForInput } from '../utils/outcomes';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type HumanNameInputProps = ComplexTypeInputProps<HumanName>;

const USE_OPTIONS = ['', 'temp', 'old', 'usual', 'official', 'nickname', 'anonymous', 'maiden'];

/**
 * HumanNameInput allows editing a FHIR HumanName.
 * @param props - The component props
 */
export function HumanNameInput(props: HumanNameInputProps): JSX.Element {
  const [value, setValue] = createSignal<HumanName>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      use: getExtendedProps(basePath + '.use'),
      prefix: getExtendedProps(basePath + '.prefix'),
      given: getExtendedProps(basePath + '.given'),
      family: getExtendedProps(basePath + '.family'),
      suffix: getExtendedProps(basePath + '.suffix'),
    };
  });

  function updateValue(newValue: HumanName): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  const errorPath = props.valuePath ?? props.path ?? '';

  return (
    <div class="flex flex-wrap gap-2">
      <NativeSelect
        disabled={props.disabled || fieldProps().use?.readonly}
        testId="name-use"
        defaultValue={value().use}
        onChange={(v) => updateValue({ ...value(), use: v as HumanName['use'] || undefined })}
        data={USE_OPTIONS}
        error={getErrorsForInput(props.outcome, errorPath + '.use')}
        class="w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().prefix?.readonly}
        placeholder="Prefix"
        name={(props.name ?? '') + '-prefix'}
        defaultValue={value().prefix?.join(' ')}
        onChange={(v) => updateValue({ ...value(), prefix: v ? v.split(' ') : undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.prefix')}
        class="w-20"
      />
      <TextInput
        disabled={props.disabled || fieldProps().given?.readonly}
        placeholder="Given"
        name={(props.name ?? '') + '-given'}
        defaultValue={value().given?.join(' ')}
        onChange={(v) => updateValue({ ...value(), given: v ? v.split(' ') : undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.given')}
        class="flex-1 min-w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().family?.readonly}
        placeholder="Family"
        name={(props.name ?? '') + '-family'}
        defaultValue={value().family}
        onChange={(v) => updateValue({ ...value(), family: v || undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.family')}
        class="flex-1 min-w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().suffix?.readonly}
        placeholder="Suffix"
        name={(props.name ?? '') + '-suffix'}
        defaultValue={value().suffix?.join(' ')}
        onChange={(v) => updateValue({ ...value(), suffix: v ? v.split(' ') : undefined })}
        error={getErrorsForInput(props.outcome, errorPath + '.suffix')}
        class="w-20"
      />
    </div>
  );
}
