// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ValueSetExpandParams } from '@medplum/core';
import type { ValueSetExpansionContains } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { AsyncAutocomplete  } from '../AsyncAutocomplete/AsyncAutocomplete';
import type {AsyncAutocompleteOption} from '../AsyncAutocomplete/AsyncAutocomplete';

export interface ValueSetAutocompleteProps {
  /** ValueSet URL binding */
  readonly binding: string | undefined;
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default selected value(s) */
  readonly defaultValue?: ValueSetExpansionContains | ValueSetExpansionContains[];
  /** Callback when selection changes */
  readonly onChange: (items: ValueSetExpansionContains[]) => void;
  /** Whether creating new items is allowed */
  readonly creatable?: boolean;
  /** Whether selection can be cleared */
  readonly clearable?: boolean;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Max number of selections (1 for single select) */
  readonly maxValues?: number;
  /** Error message */
  readonly error?: string;
  /** Additional expand parameters */
  readonly expandParams?: Partial<ValueSetExpandParams>;
  /** Whether to show system#code help text */
  readonly withHelpText?: boolean;
  /** Test ID */
  readonly testId?: string;
}

function toKey(element: ValueSetExpansionContains): string {
  if (typeof element.code === 'string') {
    return element.code;
  }
  return JSON.stringify(element);
}

function getDisplay(item: ValueSetExpansionContains): string {
  if (typeof item.display === 'string') {
    return item.display;
  }
  return toKey(item);
}

function toOption(element: ValueSetExpansionContains): AsyncAutocompleteOption<ValueSetExpansionContains> {
  return {
    value: toKey(element),
    label: getDisplay(element),
    resource: element,
  };
}

function createValue(input: string): ValueSetExpansionContains {
  return {
    code: input,
    display: input,
  };
}

/**
 * ValueSetAutocomplete provides autocomplete search against a FHIR ValueSet.
 * Base component for CodeableConceptInput, CodingInput, and CodeInput.
 * @param props
 */
export function ValueSetAutocomplete(props: ValueSetAutocompleteProps): JSX.Element {
  const medplum = useMedplum();

  const loadOptions = async (input: string, signal: AbortSignal): Promise<ValueSetExpansionContains[]> => {
    if (!props.binding) {
      return [];
    }

    try {
      const valueSet = await medplum.valueSetExpand(
        {
          ...props.expandParams,
          url: props.binding,
          filter: input,
          count: 10,
        },
        { signal }
      );

      const elements = valueSet.expansion?.contains ?? [];
      const uniqueElements: ValueSetExpansionContains[] = [];

      for (const element of elements) {
        if (element.code && !uniqueElements.some((e) => e.code === element.code)) {
          uniqueElements.push(element);
        }
      }

      return uniqueElements;
    } catch (err) {
      if (!(err as Error).message?.includes('aborted')) {
        console.error('ValueSetAutocomplete error:', err);
      }
      return [];
    }
  };

  return (
    <AsyncAutocomplete
      name={props.name}
      label={props.label}
      placeholder={props.placeholder}
      defaultValue={props.defaultValue}
      toOption={toOption}
      loadOptions={loadOptions}
      onChange={props.onChange}
      onCreate={props.creatable !== false ? createValue : undefined}
      creatable={props.creatable ?? true}
      clearable={props.clearable ?? true}
      required={props.required}
      disabled={props.disabled}
      maxValues={props.maxValues}
      error={props.error}
      testId={props.testId}
    />
  );
}
