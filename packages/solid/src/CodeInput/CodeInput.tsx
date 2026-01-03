// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ValueSetExpansionContains } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import type { ValueSetAutocompleteProps } from '../ValueSetAutocomplete/ValueSetAutocomplete';
import { ValueSetAutocomplete } from '../ValueSetAutocomplete/ValueSetAutocomplete';

export interface CodeInputProps extends Omit<ValueSetAutocompleteProps, 'defaultValue' | 'onChange'> {
  /** Default code value */
  readonly defaultValue?: string;
  /** Callback when code changes */
  readonly onChange?: (value: string | undefined) => void;
}

/**
 * CodeInput is a specialized input for FHIR code datatype.
 * Wraps ValueSetAutocomplete to work with simple string codes.
 * @param props
 */
export function CodeInput(props: CodeInputProps): JSX.Element {
  const [value, setValue] = createSignal<string | undefined>(props.defaultValue);

  function handleChange(newValues: ValueSetExpansionContains[]): void {
    const newValue = newValues[0];
    const newCode = valueSetElementToCode(newValue);
    setValue(newCode);
    if (props.onChange) {
      props.onChange(newCode);
    }
  }

  return (
    <ValueSetAutocomplete
      name={props.name}
      label={props.label}
      placeholder={props.placeholder}
      binding={props.binding}
      defaultValue={codeToValueSetElement(value())}
      onChange={handleChange}
      withHelpText={props.withHelpText ?? true}
      creatable={props.creatable}
      required={props.required}
      disabled={props.disabled}
      error={props.error}
      testId={props.testId}
    />
  );
}

function codeToValueSetElement(code: string | undefined): ValueSetExpansionContains | undefined {
  return code ? { code } : undefined;
}

function valueSetElementToCode(element: ValueSetExpansionContains | undefined): string | undefined {
  return element?.code;
}
