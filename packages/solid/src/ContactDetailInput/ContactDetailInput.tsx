// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ContactDetail, ContactPoint } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import { ContactPointInput } from '../ContactPointInput/ContactPointInput';
import { TextInput } from '../TextInput/TextInput';
import { useElementsContext } from '../ElementsContext/ElementsContext';
import type { ComplexTypeInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';

export type ContactDetailInputProps = ComplexTypeInputProps<ContactDetail>;

/**
 * ContactDetailInput allows editing FHIR ContactDetail values.
 * Includes name field and contact point (telecom) input.
 * @param props - The component props
 */
export function ContactDetailInput(props: ContactDetailInputProps): JSX.Element {
  const [contactDetail, setContactDetail] = createSignal<ContactDetail | undefined>(props.defaultValue);
  const { getExtendedProps } = useElementsContext();

  // Get extended props for each field
  const fieldProps = createMemo(() => {
    const basePath = props.path || '';
    return {
      name: getExtendedProps(basePath + '.name'),
      telecom: getExtendedProps(basePath + '.telecom'),
    };
  });

  function setContactDetailWrapper(newValue: ContactDetail | undefined): void {
    setContactDetail(newValue);
    if (props.onChange && newValue) {
      props.onChange(newValue);
    }
  }

  function setName(name: string): void {
    const current = contactDetail() ?? {};
    const newValue: ContactDetail = { ...current, name };
    if (!name) {
      delete newValue.name;
    }
    // Clean up if empty
    if (!newValue.name && !newValue.telecom?.length) {
      setContactDetailWrapper(undefined);
    } else {
      setContactDetailWrapper(newValue);
    }
  }

  function setTelecom(telecom: ContactPoint | undefined): void {
    const current = contactDetail() ?? {};
    const newValue: ContactDetail = { ...current, telecom: telecom ? [telecom] : undefined };
    if (!telecom) {
      delete newValue.telecom;
    }
    // Clean up if empty
    if (!newValue.name && !newValue.telecom?.length) {
      setContactDetailWrapper(undefined);
    } else {
      setContactDetailWrapper(newValue);
    }
  }

  return (
    <div class="flex gap-2">
      <TextInput
        name={props.name ? `${props.name}-name` : undefined}
        placeholder="Name"
        value={contactDetail()?.name ?? ''}
        onChange={setName}
        disabled={props.disabled || fieldProps().name?.readonly}
        class="w-44"
        testId={props.name ? `${props.name}-name` : undefined}
      />
      <div class="flex-1">
        <ContactPointInput
          name={props.name ? `${props.name}-telecom` : props.name ?? ''}
          path={props.path ? `${props.path}.telecom` : ''}
          defaultValue={contactDetail()?.telecom?.[0]}
          onChange={setTelecom}
          disabled={props.disabled || fieldProps().telecom?.readonly}
          outcome={props.outcome}
        />
      </div>
    </div>
  );
}
