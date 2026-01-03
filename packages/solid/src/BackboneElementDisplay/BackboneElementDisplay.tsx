// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ElementsContextType, TypedValue } from '@medplum/core';
import { buildElementsContext, getPathDisplayName, isEmpty, tryGetDataType } from '@medplum/core';
import type { AccessPolicyResource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createMemo, For } from 'solid-js';
import { DEFAULT_IGNORED_NON_NESTED_PROPERTIES, DEFAULT_IGNORED_PROPERTIES } from '../constants';
import { DescriptionList, DescriptionListEntry } from '../DescriptionList/DescriptionList';
import { ElementsContext, useElementsContext } from '../ElementsContext/ElementsContext';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';
import { getValueAndType } from '../ResourcePropertyDisplay/ResourcePropertyDisplay.utils';
import { maybeWrapWithContext } from '../utils/maybeWrapWithContext';

const EXTENSION_KEYS = ['extension', 'modifierExtension'];
const IGNORED_PROPERTIES = DEFAULT_IGNORED_PROPERTIES.filter((prop) => !EXTENSION_KEYS.includes(prop));

export interface BackboneElementDisplayProps {
  readonly value: TypedValue;
  /** The path identifies the element and is expressed as a "."-separated list of ancestor elements. */
  readonly path: string;
  readonly compact?: boolean;
  readonly ignoreMissingValues?: boolean;
  readonly link?: boolean;
  /** (optional) Profile URL of the structure definition represented by the backbone element */
  readonly profileUrl?: string;
  /** (optional) If provided, inputs specified in hiddenFields are not shown. */
  readonly accessPolicyResource?: AccessPolicyResource;
}

/**
 * BackboneElementDisplay renders a FHIR BackboneElement as a description list.
 * Uses ElementsContext for schema information.
 * @param props
 */
export function BackboneElementDisplay(props: BackboneElementDisplayProps): JSX.Element | null {
  const typedValue = props.value;
  const { value, type: typeName } = typedValue;
  const parentElementsContext = useElementsContext();
  const profileUrl = () => props.profileUrl ?? parentElementsContext?.profileUrl;

  const typeSchema = createMemo(() => tryGetDataType(typeName, profileUrl()));

  const newElementsContext = createMemo<ElementsContextType | undefined>(() => {
    const schema = typeSchema();
    if (!schema) {
      return undefined;
    }
    return buildElementsContext({
      parentContext: parentElementsContext,
      elements: schema.elements,
      path: props.path,
      profileUrl: schema.url,
      accessPolicyResource: props.accessPolicyResource,
    });
  });

  // Handle empty value
  if (isEmpty(value)) {
    return null;
  }

  const schema = typeSchema();
  if (!schema) {
    return <div>{typeName}&nbsp;not implemented</div>;
  }

  // Special case for single 'name' property
  if (
    typeof value === 'object' &&
    'name' in value &&
    Object.keys(value).length === 1 &&
    typeof value.name === 'string'
  ) {
    return <div>{value.name}</div>;
  }

  // Effective context: new or parent
  const elementsContext = () => newElementsContext() ?? parentElementsContext;

  const elementEntries = createMemo(() => {
    const ctx = elementsContext();
    return Object.entries(ctx.elements).filter(([key, property]) => {
      if (EXTENSION_KEYS.includes(key) && isEmpty(property.slicing?.slices)) {
        return false;
      }
      if (IGNORED_PROPERTIES.includes(key)) {
        return false;
      }
      if (DEFAULT_IGNORED_NON_NESTED_PROPERTIES.includes(key) && property.path.split('.').length === 2) {
        return false;
      }
      if (key.includes('.')) {
        return false;
      }
      return true;
    });
  });

  const content = (
    <DescriptionList compact={props.compact}>
      <For each={elementEntries()}>
        {([key, property]) => {
          const ctx = elementsContext();
          const [propertyValue, propertyType] = getValueAndType(typedValue, key, ctx.profileUrl);

          if ((props.ignoreMissingValues || property.max === 0) && isEmpty(propertyValue)) {
            return null;
          }

          if (props.path.endsWith('.extension') && (key === 'url' || key === 'id')) {
            return null;
          }

          const isArrayProperty = property.max > 1 || property.isArray;
          const resourcePropertyDisplay = (
            <ResourcePropertyDisplay
              property={property}
              propertyType={propertyType}
              path={props.path + '.' + key}
              value={propertyValue}
              ignoreMissingValues={props.ignoreMissingValues}
              arrayElement={isArrayProperty}
              link={props.link}
            />
          );

          if (isArrayProperty) {
            return resourcePropertyDisplay;
          }

          return (
            <DescriptionListEntry term={getPathDisplayName(key)}>
              {resourcePropertyDisplay}
            </DescriptionListEntry>
          );
        }}
      </For>
    </DescriptionList>
  );

  return maybeWrapWithContext(ElementsContext, newElementsContext(), content);
}
