// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { trimTrailingEmptyElements } from '@medplum/core';
import type { Address } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

function getLine(address: Address, index: number): string {
  return address.line && address.line.length > index ? address.line[index] : '';
}

function setLine(address: Address, index: number, str: string): Address {
  const line: string[] = [...(address.line || [])];
  while (line.length <= index) {
    line.push('');
  }
  line[index] = str;
  return { ...address, line: trimTrailingEmptyElements(line) };
}

export type AddressInputProps = ComplexTypeInputProps<Address>;

const USE_OPTIONS = ['', 'home', 'work', 'temp', 'old', 'billing'];
const TYPE_OPTIONS = ['', 'postal', 'physical', 'both'];

/**
 * AddressInput allows editing a FHIR Address.
 * @param props - The component props
 */
export function AddressInput(props: AddressInputProps): JSX.Element {
  const [value, setValue] = createSignal<Address>(props.defaultValue || {});
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      use: getExtendedProps(basePath + '.use'),
      type: getExtendedProps(basePath + '.type'),
      line1: getExtendedProps(basePath + '.line'),
      line2: getExtendedProps(basePath + '.line'),
      city: getExtendedProps(basePath + '.city'),
      state: getExtendedProps(basePath + '.state'),
      postalCode: getExtendedProps(basePath + '.postalCode'),
    };
  });

  function updateValue(newValue: Address): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <div class="flex flex-wrap gap-2">
      <NativeSelect
        disabled={props.disabled || fieldProps().use?.readonly}
        testId="address-use"
        defaultValue={value().use}
        onChange={(v) => updateValue({ ...value(), use: v as Address['use'] || undefined })}
        data={USE_OPTIONS}
        class="w-24"
      />
      <NativeSelect
        disabled={props.disabled || fieldProps().type?.readonly}
        testId="address-type"
        defaultValue={value().type}
        onChange={(v) => updateValue({ ...value(), type: v as Address['type'] || undefined })}
        data={TYPE_OPTIONS}
        class="w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().line1?.readonly}
        placeholder="Line 1"
        defaultValue={getLine(value(), 0)}
        onChange={(v) => updateValue(setLine(value(), 0, v))}
        class="flex-1 min-w-32"
      />
      <TextInput
        disabled={props.disabled || fieldProps().line2?.readonly}
        placeholder="Line 2"
        defaultValue={getLine(value(), 1)}
        onChange={(v) => updateValue(setLine(value(), 1, v))}
        class="flex-1 min-w-32"
      />
      <TextInput
        disabled={props.disabled || fieldProps().city?.readonly}
        placeholder="City"
        defaultValue={value().city}
        onChange={(v) => updateValue({ ...value(), city: v || undefined })}
        class="flex-1 min-w-24"
      />
      <TextInput
        disabled={props.disabled || fieldProps().state?.readonly}
        placeholder="State"
        defaultValue={value().state}
        onChange={(v) => updateValue({ ...value(), state: v || undefined })}
        class="w-20"
      />
      <TextInput
        disabled={props.disabled || fieldProps().postalCode?.readonly}
        placeholder="Postal Code"
        defaultValue={value().postalCode}
        onChange={(v) => updateValue({ ...value(), postalCode: v || undefined })}
        class="w-28"
      />
    </div>
  );
}
