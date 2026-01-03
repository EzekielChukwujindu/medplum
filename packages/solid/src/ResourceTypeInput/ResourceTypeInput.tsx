// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ResourceType } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { CodeInput } from '../CodeInput/CodeInput';

export interface ResourceTypeInputProps {
  /** Input name */
  readonly name: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default resource type */
  readonly defaultValue?: ResourceType;
  /** Auto focus on mount */
  readonly autoFocus?: boolean;
  /** Test ID */
  readonly testId?: string;
  /** Maximum values to show */
  readonly maxValues?: number;
  /** Change callback */
  readonly onChange?: (value: ResourceType | undefined) => void;
  /** Disabled state */
  readonly disabled?: boolean;
}

/**
 * ResourceTypeInput is an input for selecting FHIR resource types.
 * Uses CodeInput with the Medplum resource types ValueSet.
 * @param props
 */
export function ResourceTypeInput(props: ResourceTypeInputProps): JSX.Element {
  const [resourceType, setResourceType] = createSignal<string | undefined>(props.defaultValue);

  function handleChange(newResourceType: string | undefined): void {
    setResourceType(newResourceType);
    props.onChange?.(newResourceType as ResourceType);
  }

  return (
    <CodeInput
      disabled={props.disabled}
      data-autofocus={props.autoFocus}
      data-testid={props.testId}
      defaultValue={resourceType()}
      onChange={handleChange}
      name={props.name}
      placeholder={props.placeholder}
      binding="https://medplum.com/fhir/ValueSet/resource-types"
      creatable={false}
      maxValues={props.maxValues ?? 1}
      clearable={false}
      withHelpText={false}
    />
  );
}
