// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getPropertyDisplayName } from '@medplum/core';
import type { ElementDefinition, OperationOutcome, ElementDefinitionType, ElementDefinitionBinding } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export interface ResourcePropertyInputProps {
  /** Property definition */
  readonly property: ElementDefinition;
  /** Property name */
  readonly name: string;
  /** Schema path */
  readonly path: string;
  /** Value path for error matching */
  readonly valuePath?: string;
  /** Default value */
  readonly defaultValue?: unknown;
  /** Default property type */
  readonly defaultPropertyType?: string;
  /** Callback when value changes */
  readonly onChange?: (value: unknown) => void;
  /** Operation outcome for validation errors */
  readonly outcome?: OperationOutcome;
  /** Whether the field is an array */
  readonly array?: boolean;
  /** Test ID */
  readonly testId?: string;
}

/**
 * ResourcePropertyInput renders an appropriate input for a FHIR element definition.
 * This is a stub implementation that can be expanded with full type support.
 */

export function ResourcePropertyInput(props: ResourcePropertyInputProps): JSX.Element {
  const propertyTypes = props.property.type;
  const defaultPropertyType = props.defaultPropertyType ?? propertyTypes?.[0]?.code ?? 'string';

  // TODO: Handle arrays and choice types (Reference, Quantity, etc)
  
  return (
    <div data-testid={props.testId} class="form-control">
      <label class="label">
        <span class="label-text">{getPropertyDisplayName(props.name)}</span>
      </label>
      <ElementDefinitionTypeInput
        name={props.name}
        defaultValue={props.defaultValue}
        onChange={props.onChange}
        outcome={props.outcome}
        elementDefinitionType={propertyTypes?.[0] ?? { code: defaultPropertyType }}
        min={props.property.min}
        max={props.property.max}
        path={props.path}
        valuePath={props.valuePath}
      />
    </div>
  );
}

export interface ElementDefinitionTypeInputProps {
    readonly name: string;
    readonly defaultValue?: unknown;
    readonly onChange?: (value: unknown) => void;
    readonly outcome?: OperationOutcome;
    readonly elementDefinitionType: ElementDefinitionType;
    readonly min?: number;
    readonly max?: number | string;
    readonly path: string;
    readonly valuePath?: string;
    readonly readOnly?: boolean;
    readonly binding?: ElementDefinitionBinding;
}

export function ElementDefinitionTypeInput(props: ElementDefinitionTypeInputProps): JSX.Element {
    const propertyType = props.elementDefinitionType.code;

    // Basic types that the stub supports
    return (
        <Show
            when={propertyType !== 'boolean'}
            fallback={
                <input
                    type="checkbox"
                    name={props.name}
                    class="checkbox"
                    checked={!!props.defaultValue}
                    onChange={(e) => props.onChange?.(e.currentTarget.checked)}
                    disabled={props.readOnly}
                />
            }
        >
            <input
                type={propertyType === 'integer' || propertyType === 'decimal' ? 'number' : 'text'}
                name={props.name}
                class="input input-bordered w-full"
                value={String(props.defaultValue ?? '')}
                onInput={(e) => props.onChange?.(e.currentTarget.value)}
                readOnly={props.readOnly}
            />
        </Show>
    );
}

