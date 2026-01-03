// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ExtendedInternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import type { ElementDefinition } from '@medplum/fhirtypes';
import { getPathDisplayName } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show, useContext } from 'solid-js';
import { ElementsContext } from '../ElementsContext/ElementsContext';
import { ResourcePropertyInput } from '../ResourcePropertyInput/ResourcePropertyInput';
import type { BaseInputProps } from '../ResourcePropertyInput/ResourcePropertyInput.utils';
import { getValuePath } from '../ResourcePropertyInput/ResourcePropertyInput.utils';
import { SliceInput } from '../SliceInput/SliceInput';
import { ArrayAddButton } from '../buttons/ArrayAddButton';
import { ArrayRemoveButton } from '../buttons/ArrayRemoveButton';
import { killEvent } from '../utils/dom';
import { assignValuesIntoSlices, prepareSlices } from './ResourceArrayInput.utils';

export interface ResourceArrayInputProps extends BaseInputProps {
  readonly property: ExtendedInternalSchemaElement;
  readonly name: string;
  readonly defaultValue?: any[];
  readonly indent?: boolean;
  readonly onChange?: (value: any[]) => void;
  readonly hideNonSliceValues?: boolean;
}

export function ResourceArrayInput(props: ResourceArrayInputProps): JSX.Element {
  const medplum = useMedplum();
  const [loading, setLoading] = createSignal(true);
  const [slices, setSlices] = createSignal<SliceDefinitionWithTypes[]>([]);
  
  // Initialize with props.defaultValue or empty array
  // In React `useState(() => ...)` only runs once. Solid `createSignal` also takes initial value.
  // We need to be careful if props.defaultValue changes. React doesn't reset state if props change usually unless key changes.
  // We'll assume similar behavior: internal state initialized from props.
  const [defaultValue] = createSignal<any[]>(Array.isArray(props.defaultValue) ? props.defaultValue : []);
  const [slicedValues, setSlicedValues] = createSignal<any[][]>([defaultValue()]);
  
  const ctx = useContext(ElementsContext);

  const propertyTypeCode = () => props.property.type[0]?.code;

  createEffect(() => {
    const prop = props.property;
    prepareSlices({
      medplum,
      property: prop,
    })
      .then((s) => {
        setSlices(s);
        // Important: assignValuesIntoSlices needs the current defaultValue, which we initialized state with.
        const sv = assignValuesIntoSlices(defaultValue(), s, prop.slicing, ctx.profileUrl);
        addPlaceholderValues(sv, s);
        setSlicedValues(sv);
        setLoading(false);
      })
      .catch((reason) => {
        console.error(reason);
        setLoading(false);
      });
  });

  function setValuesWrapper(newValues: any[], sliceIndex: number): void {
    const newSlicedValues = [...slicedValues()];
    newSlicedValues[sliceIndex] = newValues;
    setSlicedValues(newSlicedValues);
    if (props.onChange) {
      // Remove any placeholder (i.e. undefined) values before propagating
      const cleaned = newSlicedValues.flat().filter((val) => val !== undefined);
      props.onChange(cleaned);
    }
  }

  const nonSliceIndex = () => slices().length;
  const nonSliceValues = () => slicedValues()[nonSliceIndex()];

  // Hide non-sliced values when handling sliced extensions
  const showNonSliceValues = () => !(props.hideNonSliceValues ?? (propertyTypeCode() === 'Extension' && slices().length > 0));
  const propertyDisplayName = () => getPathDisplayName(props.property.path);
  const showEmptyMessage = () => props.property.readonly && slices().length === 0 && defaultValue().length === 0;

  return (
    <Show when={!loading()} fallback={<div>Loading...</div>}>
      <div class={`space-y-2 ${props.indent ? 'pl-4 border-l border-base-200' : ''}`}>
        <Show when={showEmptyMessage()}>
             <div class="text-base-content/60">(empty)</div>
        </Show>
        <For each={slices()}>
            {(slice, sliceIndex) => (
                <SliceInput
                    slice={slice}
                    path={props.path}
                    valuePath={props.valuePath}
                    property={props.property}
                    defaultValue={slicedValues()[sliceIndex()]}
                    onChange={(newValue: any[]) => {
                        setValuesWrapper(newValue, sliceIndex());
                    }}
                    testId={`slice-${slice.name}`}
                />
            )}
        </For>

        <Show when={showNonSliceValues()}>
            <For each={nonSliceValues()}>
                {(value, valueIndex) => (
                    <div class="flex gap-2 items-start">
                        <div class="flex-grow">
                            <ResourcePropertyInput
                                property={props.property as unknown as ElementDefinition}
                                name={props.name + '.' + valueIndex()}
                                path={props.path}
                                valuePath={getValuePath(props.path, props.valuePath, valueIndex())}
                                defaultValue={value}
                                onChange={(newValue: any) => {
                                    const newNonSliceValues = [...nonSliceValues()];
                                    newNonSliceValues[valueIndex()] = newValue;
                                    setValuesWrapper(newNonSliceValues, nonSliceIndex());
                                }}
                                defaultPropertyType={undefined}
                                outcome={props.outcome}
                            />
                        </div>
                        <Show when={!props.property.readonly}>
                            <ArrayRemoveButton
                                propertyDisplayName={propertyDisplayName()}
                                testId={`nonsliced-remove-${valueIndex()}`}
                                onClick={(e) => {
                                    killEvent(e);
                                    const newNonSliceValues = [...nonSliceValues()];
                                    newNonSliceValues.splice(valueIndex(), 1);
                                    setValuesWrapper(newNonSliceValues, nonSliceIndex());
                                }}
                            />
                        </Show>
                    </div>
                )}
            </For>
            
            <Show when={!props.property.readonly && slicedValues().flat().length < props.property.max}>
                <div class="flex justify-start">
                     <ArrayAddButton
                        propertyDisplayName={propertyDisplayName()}
                        onClick={(e) => {
                            killEvent(e);
                            const newNonSliceValues = [...nonSliceValues()];
                            newNonSliceValues.push(undefined);
                            setValuesWrapper(newNonSliceValues, nonSliceIndex());
                        }}
                        testId="nonsliced-add"
                     />
                </div>
            </Show>
        </Show>
      </div>
    </Show>
  );
}

function addPlaceholderValues(slicedValues: any[][], slices: SliceDefinitionWithTypes[]): void {
  for (let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++) {
    const slice = slices[sliceIndex];
    const sliceValues = slicedValues[sliceIndex];

    while (sliceValues.length < slice.min) {
      sliceValues.push(undefined);
    }
  }
}
