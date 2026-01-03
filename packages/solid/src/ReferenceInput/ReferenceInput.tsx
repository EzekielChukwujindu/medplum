// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type { Reference, Resource, ResourceType as FHIRResourceType } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { ResourceInput } from '../ResourceInput/ResourceInput';
import { NativeSelect } from '../NativeSelect/NativeSelect';

export interface ReferenceInputProps<T extends Resource = Resource> {
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Default value */
  readonly defaultValue?: Reference<T>;
  /** Target resource types allowed */
  readonly targetTypes?: string[];
  /** Additional search criteria */
  readonly searchCriteria?: Record<string, string>;
  /** Auto focus on mount */
  readonly autoFocus?: boolean;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Callback when value changes */
  readonly onChange?: (value: Reference<T> | undefined) => void;
  /** Error message */
  readonly error?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * ReferenceInput allows selecting a FHIR Reference.
 * Supports multiple target types with a type selector when needed.
 * @param props
 */
export function ReferenceInput<T extends Resource = Resource>(props: ReferenceInputProps<T>): JSX.Element {
  const getInitialResourceType = (): string | undefined => {
    if (props.defaultValue?.reference) {
      return props.defaultValue.reference.split('/')[0];
    }
    if (props.targetTypes && props.targetTypes.length > 0) {
      // Filter out profile URLs
      const resourceTypes = props.targetTypes.filter((t) => !t.includes('/'));
      return resourceTypes[0];
    }
    return undefined;
  };

  const [selectedType, setSelectedType] = createSignal<string | undefined>(getInitialResourceType());
  const [_value, setValue] = createSignal<Reference<T> | undefined>(props.defaultValue);

  function handleResourceChange(resource: T | undefined): void {
    const newValue = resource ? createReference(resource) as Reference<T> : undefined;
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function handleTypeChange(newType: string): void {
    setSelectedType(newType);
    // Clear the value when type changes
    setValue(undefined);
    if (props.onChange) {
      props.onChange(undefined);
    }
  }

  // Filter to just resource types (not profile URLs) for the selector
  const resourceTypes = (): string[] => {
    if (!props.targetTypes) {return [];}
    return props.targetTypes.filter((t) => !t.includes('/'));
  };

  const showTypeSelector = resourceTypes().length > 1;

  return (
    <div class="form-control" data-testid={props.testId}>
      {props.label && (
        <label class="label">
          <span class="label-text">
            {props.label}
            {props.required && <span class="text-error ml-1">*</span>}
          </span>
        </label>
      )}

      <div class="flex gap-2">
        <Show when={showTypeSelector}>
          <NativeSelect
            disabled={props.disabled}
            testId={(props.testId ?? 'reference') + '-type'}
            defaultValue={selectedType()}
            onChange={handleTypeChange}
            data={resourceTypes()}
            class="w-40"
          />
        </Show>

        <div class="flex-1">
          <Show when={selectedType()}>
            <ResourceInput
              resourceType={selectedType() as FHIRResourceType}
              name={props.name}
              placeholder={props.placeholder}
              searchCriteria={props.searchCriteria}
              required={props.required}
              disabled={props.disabled}
              onChange={handleResourceChange}
              error={props.error}
              testId={(props.testId ?? 'reference') + '-resource'}
            />
          </Show>
          <Show when={!selectedType()}>
            <input
              type="text"
              class="input input-bordered w-full"
              placeholder="Select a resource type first..."
              disabled
            />
          </Show>
        </div>
      </div>

      {props.error && (
        <label class="label">
          <span class="label-text-alt text-error">{props.error}</span>
        </label>
      )}
    </div>
  );
}
