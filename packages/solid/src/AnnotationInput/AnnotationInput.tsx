// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type { Annotation } from '@medplum/fhirtypes';
import { useMedplumProfile } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { TextInput } from '../TextInput/TextInput';

export interface AnnotationInputProps {
  /** Input name */
  readonly name?: string;
  /** Default annotation value */
  readonly defaultValue?: Annotation;
  /** Callback on change */
  readonly onChange?: (value: Annotation | undefined) => void;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * AnnotationInput allows entering FHIR Annotation values.
 * Automatically sets author and timestamp when text is entered.
 * @param props
 */
export function AnnotationInput(props: AnnotationInputProps): JSX.Element {
  const profile = useMedplumProfile();
  const [value, setValue] = createSignal<Annotation>(props.defaultValue || ({} as Annotation));

  function setText(text: string): void {
    const newValue: Annotation = text
      ? {
          text,
          authorReference: profile ? createReference(profile) : undefined,
          time: new Date().toISOString(),
        }
      : ({} as Annotation);

    setValue(newValue);
    if (props.onChange) {
      props.onChange(text ? newValue : undefined);
    }
  }

  return (
    <TextInput
      name={props.name}
      placeholder={props.placeholder ?? 'Annotation text'}
      value={value().text ?? ''}
      onChange={setText}
      disabled={props.disabled}
      testId={props.testId}
    />
  );
}
