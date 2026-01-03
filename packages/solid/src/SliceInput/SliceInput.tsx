// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { buildElementsContext, getPropertyDisplayName, isEmpty, isPopulated } from '@medplum/core';
import type { ExtendedInternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import type { JSX} from 'solid-js';
import { createMemo, createSignal, useContext , For, Show } from 'solid-js';

import { FormSection } from '../FormSection/FormSection';
import { ElementsContext } from '../ElementsContext/ElementsContext';
import { ElementDefinitionTypeInput } from '../ResourcePropertyInput/ResourcePropertyInput';
import type { BaseInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';
import { ArrayAddButton } from '../buttons/ArrayAddButton';
import { ArrayRemoveButton } from '../buttons/ArrayRemoveButton';
import { killEvent } from '../utils/dom';
import { maybeWrapWithContext } from '../utils/maybeWrapWithContext';

export interface SliceInputProps extends BaseInputProps {
  readonly slice: SliceDefinitionWithTypes;
  readonly property: ExtendedInternalSchemaElement;
  readonly defaultValue: any[];
  readonly onChange: (newValue: any[]) => void;
  readonly testId?: string;
}

export function SliceInput(props: SliceInputProps): JSX.Element | null {
  // Use createSignal for local state if needed, but props.defaultValue is initial
  // Solid props are reactive, so we might need effect if defaultValue changes?
  // React implementation uses useState initialized with props.defaultValue.
  const [values, setValues] = createSignal<any[]>(props.defaultValue || []);

  const sliceElements = () => props.slice.typeSchema?.elements ?? props.slice.elements;

  const parentElementsContextValue = useContext(ElementsContext);

  const contextValue = createMemo(() => {
    const el = sliceElements();
    if (isPopulated(el)) {
      return buildElementsContext({
        parentContext: parentElementsContextValue,
        elements: el,
        path: props.path,
        profileUrl: props.slice.typeSchema?.url,
      });
    }
    return undefined;
  });

  function setValuesWrapper(newValues: any[]): void {
    setValues(newValues);
    if (props.onChange) {
        // Deep copy not strictly needed if we replace array, but good practice
      props.onChange(newValues);
    }
  }

  const required = () => props.slice.min > 0;

  // indentedStack logic from React
  const indentedStack = () => isEmpty(props.slice.elements);
  const propertyDisplayName = () => getPropertyDisplayName(props.slice.name);
  const showEmptyMessage = () => props.property.readonly && values().length === 0;

  // We need to render content wrapped in maybe context
  // maybeWrapWithContext is a function that returns JSX.
  // In Solid, we can use Dynamic or just call it if it returns an element.
  // But maybeWrapWithContext expects children as 3rd arg.

  const content = (
    <FormSection
      title={propertyDisplayName()}
      description={props.slice.definition}
      withAsterisk={required()}
      fhirPath={`${props.property.path}:${props.slice.name}`}
      testId={props.testId}
      readonly={props.property.readonly}
    >
      <Show when={!showEmptyMessage()} fallback={<div class="text-base-content/60">(empty)</div>}>
         <div class={indentedStack() ? 'pl-4 border-l border-base-200' : ''}>
           <div class="space-y-2">
            <For each={values()}>
                {(value, index) => (
                    <div class="flex gap-2 items-start">
                        <div class="flex-grow" data-testid={props.testId && `${props.testId}-elements-${index()}`}>
                             <ElementDefinitionTypeInput
                                elementDefinitionType={props.slice.type[0]}
                                name={props.slice.name}
                                defaultValue={value}
                                onChange={(newValue) => {
                                    const newValues = [...values()];
                                    newValues[index()] = newValue;
                                    setValuesWrapper(newValues);
                                }}
                                outcome={props.outcome}
                                min={props.slice.min}
                                max={props.slice.max}
                                binding={props.slice.binding}
                                path={props.path}
                                // valuePath not supported in slices per React code
                                readOnly={props.property.readonly}
                             />
                        </div>
                        <Show when={!props.property.readonly && values().length > props.slice.min}>
                             <ArrayRemoveButton
                                propertyDisplayName={propertyDisplayName()}
                                testId={props.testId && `${props.testId}-remove-${index()}`}
                                onClick={(e) => {
                                    killEvent(e);
                                    const newValues = [...values()];
                                    newValues.splice(index(), 1);
                                    setValuesWrapper(newValues);
                                }}
                             />
                        </Show>
                    </div>
                )}
            </For>
            <Show when={!props.property.readonly && values().length < props.slice.max}>
                 <div class="flex justify-start">
                     <ArrayAddButton
                        propertyDisplayName={propertyDisplayName()}
                        onClick={(e) => {
                             killEvent(e);
                             const newValues = [...values(), undefined];
                             setValuesWrapper(newValues);
                        }}
                        testId={props.testId && `${props.testId}-add`}
                     />
                 </div>
            </Show>
           </div>
         </div>
      </Show>
    </FormSection>
  );

  return maybeWrapWithContext(ElementsContext, contextValue(), content);
}
