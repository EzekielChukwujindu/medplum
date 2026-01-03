// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { buildElementsContext, isPopulated } from '@medplum/core';
import type { ElementsContextType, InternalSchemaElement, SliceDefinitionWithTypes } from '@medplum/core';
import type { JSX } from 'solid-js';
import { createMemo, For, useContext } from 'solid-js';
import { ElementsContext } from '../ElementsContext/ElementsContext';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';
import { maybeWrapWithContext } from '../utils/maybeWrapWithContext';

export interface SliceDisplayProps {
  readonly path: string;
  readonly slice: SliceDefinitionWithTypes;
  readonly property: InternalSchemaElement;
  readonly value: any[];
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
}

export function SliceDisplay(props: SliceDisplayProps): JSX.Element {
  const parentContext = useContext(ElementsContext);

  const contextValue = createMemo<ElementsContextType | undefined>(() => {
    const sliceElements = props.slice.typeSchema?.elements ?? props.slice.elements;
    if (isPopulated(sliceElements)) {
      return buildElementsContext({
        parentContext,
        elements: sliceElements,
        path: props.path,
        profileUrl: props.slice.typeSchema?.url,
      });
    }
    return undefined;
  });

  return (
    <>
      {maybeWrapWithContext(
        ElementsContext,
        contextValue(),
        <For each={props.value}>
          {(value) => (
            <div>
              <ResourcePropertyDisplay
                property={props.property}
                path={props.path}
                arrayElement={true}
                elementDefinitionType={props.slice.type[0]}
                propertyType={props.slice.type[0].code}
                value={value}
                ignoreMissingValues={props.ignoreMissingValues}
                link={props.link}
              />
            </div>
          )}
        </For>
      )}
    </>
  );
}
