// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { CodeableConcept, OperationOutcome, ValueSetExpansionContains } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { ValueSetAutocomplete } from '../ValueSetAutocomplete/ValueSetAutocomplete';

export interface CodeableConceptInputProps {
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default value */
  readonly defaultValue?: CodeableConcept;
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
  /** Whether to show system#code help text */
  readonly withHelpText?: boolean;
  /** Callback when value changes */
  readonly onChange?: (value: CodeableConcept | undefined) => void;
  /** Test ID */
  readonly testId?: string;
}

function codeableConceptToValueSetElements(concept: CodeableConcept): ValueSetExpansionContains[] | undefined {
  return concept.coding?.map((c) => ({
    system: c.system,
    code: c.code,
    display: c.display,
  }));
}

function valueSetElementsToCodeableConcept(elements: ValueSetExpansionContains[]): CodeableConcept | undefined {
  if (elements.length === 0) {
    return undefined;
  }
  return {
    coding: elements.map((e) => ({
      system: e.system,
      code: e.code,
      display: e.display,
    })),
  };
}

/**
 * CodeableConceptInput allows selecting one or more codings from a ValueSet.
 * @param props
 */
export function CodeableConceptInput(props: CodeableConceptInputProps): JSX.Element {
  const [value, setValue] = createSignal<CodeableConcept | undefined>(props.defaultValue);

  function handleChange(elements: ValueSetExpansionContains[]): void {
    const newConcept = valueSetElementsToCodeableConcept(elements);
    setValue(newConcept);
    if (props.onChange) {
      props.onChange(newConcept);
    }
  }

  return (
    <ValueSetAutocomplete
      name={props.name}
      label={props.label}
      placeholder={props.placeholder ?? 'Search codes...'}
      binding={props.binding}
      defaultValue={value() ? codeableConceptToValueSetElements(value()!) : undefined}
      onChange={handleChange}
      creatable={props.creatable ?? true}
      required={props.required}
      disabled={props.disabled}
      withHelpText={props.withHelpText ?? true}
      error={props.error}
      testId={props.testId ?? 'codeable-concept-input'}
    />
  );
}
