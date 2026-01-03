// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getPathDisplayName, isPopulated } from '@medplum/core';
import type { InternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show, useContext } from 'solid-js';
import { DescriptionListEntry } from '../DescriptionList/DescriptionList';
import { ElementsContext } from '../ElementsContext/ElementsContext';
import { assignValuesIntoSlices, prepareSlices } from '../ResourceArrayInput/ResourceArrayInput.utils';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';
import { SliceDisplay } from '../SliceDisplay/SliceDisplay';

const MAX_ARRAY_SIZE = 50;

export interface ResourceArrayDisplayProps {
  /** The path identifies the element and is expressed as a "."-separated list of ancestor elements, beginning with the name of the resource or extension. */
  readonly path?: string;
  readonly property: InternalSchemaElement;
  readonly propertyType: string;
  readonly values: any[];
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
  readonly includeDescriptionListEntry?: boolean;
}

export function ResourceArrayDisplay(props: ResourceArrayDisplayProps): JSX.Element | null {
  const medplum = useMedplum();
  const [loading, setLoading] = createSignal(true);
  const [slices, setSlices] = createSignal<SliceDefinitionWithTypes[]>([]);
  const [slicedValues, setSlicedValues] = createSignal<any[][]>([props.values || []]);
  const ctx = useContext(ElementsContext);

  createEffect(() => {
    prepareSlices({
      medplum,
      property: props.property,
    })
      .then((newSlices) => {
        setSlices(newSlices);
        const limitedValues = (props.values || []).slice(0, MAX_ARRAY_SIZE);
        const newSlicedValues = assignValuesIntoSlices(limitedValues, newSlices, props.property.slicing, ctx?.profileUrl);
        setSlicedValues(newSlicedValues);
        setLoading(false);
      })
      .catch((reason) => {
        console.error(reason);
        setLoading(false);
      });
  });

  return (
    <Show when={!loading()} fallback={<div>Loading...</div>}>
      <For each={slices()}>
        {(slice, i) => {
          if (!props.path) {
            throw new Error(`Displaying a resource property with slices of type ${props.propertyType} requires path`);
          }
          const sliceDisplay = (
            <SliceDisplay
              path={props.path}
              slice={slice}
              property={props.property}
              value={slicedValues()[i()]}
              ignoreMissingValues={props.ignoreMissingValues}
              link={props.link}
            />
          );

          if (props.includeDescriptionListEntry) {
            return (
              <DescriptionListEntry term={getPathDisplayName(slice.name)}>
                {sliceDisplay}
              </DescriptionListEntry>
            );
          }
          return sliceDisplay;
        }}
      </For>

      <Show when={props.property.type[0]?.code !== 'Extension'}>
        <Show
          when={props.includeDescriptionListEntry}
          fallback={
            <For each={slicedValues()[slices().length]}>
              {(value) => (
                <div>
                  <ResourcePropertyDisplay
                    path={props.path}
                    arrayElement={true}
                    property={props.property}
                    propertyType={props.propertyType}
                    value={value}
                    ignoreMissingValues={props.ignoreMissingValues}
                    link={props.link}
                  />
                </div>
              )}
            </For>
          }
        >
          <Show when={isPopulated(props.path) && props.path?.split('.').pop()} fallback={null}>
            {(key) => (
              <DescriptionListEntry term={getPathDisplayName(key())}>
                <For each={slicedValues()[slices().length]}>
                  {(value) => (
                    <div>
                      <ResourcePropertyDisplay
                        path={props.path}
                        arrayElement={true}
                        property={props.property}
                        propertyType={props.propertyType}
                        value={value}
                        ignoreMissingValues={props.ignoreMissingValues}
                        link={props.link}
                      />
                    </div>
                  )}
                </For>
              </DescriptionListEntry>
            )}
          </Show>
        </Show>
      </Show>

      <Show when={(props.values?.length || 0) > MAX_ARRAY_SIZE}>
        <div class="text-right">
          <span class="text-gray-500">... {props.values?.length || 0} total values</span>
        </div>
      </Show>
    </Show>
  );
}
