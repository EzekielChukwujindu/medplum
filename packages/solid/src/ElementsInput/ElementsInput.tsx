// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { TypedValue } from '@medplum/core';
import { getPathDisplayName } from '@medplum/core';
import type { ElementDefinition, OperationOutcome } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createMemo, createSignal, For } from 'solid-js';
import { CheckboxFormSection } from '../CheckboxFormSection/CheckboxFormSection';
import { useElementsContext, getElementsToRender, EXTENSION_KEYS } from '../ElementsContext/ElementsContext';
import { FormSection } from '../FormSection/FormSection';
import { ResourcePropertyInput } from '../ResourcePropertyInput/ResourcePropertyInput';

export interface ElementsInputProps {
  /** Schema path */
  readonly path: string;
  /** Value path for error matching */
  readonly valuePath?: string;
  /** Type name */
  readonly type: string;
  /** Default value object */
  readonly defaultValue: Record<string, unknown>;
  /** Callback when value changes */
  readonly onChange?: (value: Record<string, unknown>) => void;
  /** Operation outcome for validation errors */
  readonly outcome?: OperationOutcome;
  /** Test ID */
  readonly testId?: string;
}

/**
 * ElementsInput renders input fields for all elements of a FHIR type.
 * Uses the ElementsContext to determine which fields to render.
 * @param props
 */
export function ElementsInput(props: ElementsInputProps): JSX.Element {
  const [value, setValue] = createSignal<Record<string, unknown>>(props.defaultValue ?? {});
  const elementsContext = useElementsContext();

  const elementsToRender = createMemo(() => {
    return getElementsToRender(elementsContext.elements);
  });

  function setValueWrapper(newValue: Record<string, unknown>): void {
    setValue(newValue);
    if (props.onChange) {
      props.onChange(newValue);
    }
  }

  function setPropertyValue(
    current: Record<string, unknown>,
    key: string,
    newValue: unknown
  ): Record<string, unknown> {
    const result = { ...current };
    if (newValue === undefined || newValue === null || newValue === '') {
      delete result[key];
    } else {
      result[key] = newValue;
    }
    return result;
  }

  function getValueAndType(key: string): [unknown, string | undefined] {
    const v = value();
    const propertyValue = v[key];
    const elements = elementsContext.elements[key];
    const propertyType = elements?.type?.[0]?.code;
    return [propertyValue, propertyType];
  }

  const _typedValue = (): TypedValue => ({ type: props.type, value: value() });

  return (
    <div class="space-y-4" data-testid={props.testId}>
      <For each={elementsToRender()}>
        {([key, element]) => {
          const [propertyValue, propertyType] = getValueAndType(key);
          const required = element.min !== undefined && element.min > 0;
          const valuePath = props.valuePath ? `${props.valuePath}.${key}` : undefined;

          const resourcePropertyInput = (
            <ResourcePropertyInput
              property={element as unknown as ElementDefinition}
              name={key}
              path={`${props.path}.${key}`}
              valuePath={valuePath}
              defaultValue={propertyValue}
              defaultPropertyType={propertyType}
              onChange={(newValue: unknown) => {
                setValueWrapper(setPropertyValue(value(), key, newValue));
              }}
              outcome={props.outcome}
            />
          );

          // No FormSection wrapper for extensions
          if (props.type === 'Extension' || EXTENSION_KEYS.includes(key)) {
            return resourcePropertyInput;
          }

          if (element.type.length === 1 && element.type[0].code === 'boolean') {
            return (
              <CheckboxFormSection
                title={getPathDisplayName(key)}
                description={element.description}
                htmlFor={key}
                withAsterisk={required}
              >
                {resourcePropertyInput}
              </CheckboxFormSection>
            );
          }

          return (
            <FormSection
              title={getPathDisplayName(key)}
              description={element.description}
              htmlFor={key}
              withAsterisk={required}
              outcome={props.outcome}
            >
              {resourcePropertyInput}
            </FormSection>
          );
        }}
      </For>
    </div>
  );
}
