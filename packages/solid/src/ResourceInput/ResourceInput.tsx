// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getDisplayString, getReferenceString } from '@medplum/core';
import type { Reference, Resource, ResourceType as FHIRResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal } from 'solid-js';
import { AsyncAutocomplete  } from '../AsyncAutocomplete/AsyncAutocomplete';
import type {AsyncAutocompleteOption} from '../AsyncAutocomplete/AsyncAutocomplete';

/**
 * Search parameter overrides for specific resource types.
 */
const SEARCH_CODES: Record<string, string> = {
  Device: 'device-name',
  Observation: 'code',
  Subscription: 'criteria',
  User: 'email:contains',
};

/**
 * Resource types that should use the "name" search parameter.
 */
const NAME_RESOURCE_TYPES = [
  'AccessPolicy', 'Account', 'ActivityDefinition', 'Bot', 'CapabilityStatement',
  'CareTeam', 'ClientApplication', 'CodeSystem', 'CompartmentDefinition', 'ConceptMap',
  'Endpoint', 'EventDefinition', 'Evidence', 'EvidenceVariable', 'ExampleScenario',
  'GraphDefinition', 'Group', 'HealthcareService', 'ImplementationGuide', 'InsurancePlan',
  'Library', 'Location', 'Measure', 'MedicinalProduct', 'MessageDefinition',
  'NamingSystem', 'OperationDefinition', 'Organization', 'Patient', 'Person',
  'PlanDefinition', 'Practitioner', 'Project', 'Questionnaire', 'RelatedPerson',
  'ResearchDefinition', 'ResearchElementDefinition', 'ResearchStudy', 'RiskEvidenceSynthesis',
  'SearchParameter', 'StructureDefinition', 'StructureMap', 'TerminologyCapabilities',
  'TestScript', 'UserConfiguration', 'ValueSet',
];

export interface ResourceInputProps<T extends Resource = Resource> {
  /** Resource type to search */
  readonly resourceType: FHIRResourceType;
  /** Input name */
  readonly name?: string;
  /** Label text */
  readonly label?: string;
  /** Default value */
  readonly defaultValue?: T | Reference<T>;
  /** Additional search criteria */
  readonly searchCriteria?: Record<string, string>;
  /** Placeholder text */
  readonly placeholder?: string;
  /** Whether input is required */
  readonly required?: boolean;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Callback when value changes */
  readonly onChange?: (value: T | undefined) => void;
  /** Error message */
  readonly error?: string;
  /** Test ID */
  readonly testId?: string;
}

function toOption<T extends Resource>(resource: T): AsyncAutocompleteOption<T> {
  return {
    value: getReferenceString(resource) ?? '',
    label: getDisplayString(resource),
    resource,
  };
}

function getSearchParamForResourceType(resourceType: string): string {
  return SEARCH_CODES[resourceType] ?? (NAME_RESOURCE_TYPES.includes(resourceType) ? 'name' : '_id');
}

/**
 * ResourceInput allows searching and selecting a FHIR resource by type.
 * @param props
 */
export function ResourceInput<T extends Resource = Resource>(props: ResourceInputProps<T>): JSX.Element {
  const medplum = useMedplum();
  const [value, setValue] = createSignal<T | undefined>(
    props.defaultValue && 'resourceType' in props.defaultValue ? props.defaultValue as T : undefined
  );

  async function loadOptions(input: string, signal: AbortSignal): Promise<T[]> {
    if (!props.resourceType) {
      return [];
    }

    const searchCode = getSearchParamForResourceType(props.resourceType);
    const searchParams = new URLSearchParams({
      [searchCode]: input ?? '',
      _count: '10',
      ...props.searchCriteria,
    });

    try {
      const resources = await medplum.searchResources(props.resourceType, searchParams, { signal });
      return resources as unknown as T[];
    } catch (err) {
      if (!(err as Error).message?.includes('aborted')) {
        console.error('ResourceInput search error:', err);
      }
      return [];
    }
  }

  function handleChange(resources: T[]): void {
    const newValue = resources[0];
    setValue(() => newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  return (
    <AsyncAutocomplete<T>
      name={props.name}
      label={props.label}
      placeholder={props.placeholder ?? `Search ${props.resourceType}...`}
      defaultValue={value()}
      toOption={toOption}
      loadOptions={loadOptions}
      onChange={handleChange}
      required={props.required}
      disabled={props.disabled}
      maxValues={1}
      clearable
      error={props.error}
      testId={props.testId ?? 'resource-input'}
    />
  );
}
