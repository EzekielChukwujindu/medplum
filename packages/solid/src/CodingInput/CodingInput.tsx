// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Coding, OperationOutcome, ValueSetExpansionContains } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { ValueSetAutocomplete } from '../ValueSetAutocomplete/ValueSetAutocomplete';

export interface CodingInputProps {
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default value */
  readonly defaultValue?: Coding;
  /** ValueSet URL binding */
  readonly binding?: string;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Whether input is required */
  readonly required?: boolean;
  /** OperationOutcome for errors */
  readonly outcome?: OperationOutcome;
  /** Error message */
  readonly error?: string;
  /** Whether creating new codes is allowed */
  readonly creatable?: boolean;
  /** Callback when value changes */
  readonly onChange?: (value: Coding | undefined) => void;
  /** Test ID */
  readonly testId?: string;
}

function codingToValueSetElement(coding: Coding): ValueSetExpansionContains {
  return {
    system: coding.system,
    code: coding.code,
    display: coding.display,
  };
}

function valueSetElementToCoding(element: ValueSetExpansionContains): Coding {
  return {
    system: element.system,
    code: element.code,
    display: element.display,
  };
}

/**
 * CodingInput allows selecting a FHIR Coding from a ValueSet.
 * @param props
 */
export function CodingInput(props: CodingInputProps): JSX.Element {
  const [value, setValue] = createSignal<Coding | undefined>(props.defaultValue);

  function handleChange(items: ValueSetExpansionContains[]): void {
    const newValue = items.length > 0 ? valueSetElementToCoding(items[0]) : undefined;
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <ValueSetAutocomplete
      name={props.name}
      label={props.label}
      placeholder={props.placeholder ?? 'Search codes...'}
      binding={props.binding}
      defaultValue={value() ? codingToValueSetElement(value()!) : undefined}
      onChange={handleChange}
      creatable={props.creatable ?? true}
      required={props.required}
      disabled={props.disabled}
      maxValues={1}
      error={props.error}
      testId={props.testId ?? 'coding-input'}
    />
  );
}
