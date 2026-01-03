// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type {
  InternalSchemaElement,
  InternalTypeSchema,
  SearchRequest} from '@medplum/core';
import {
  getDataType,
  getSearchParameters
} from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';

export interface SearchControlField {
  name: string;
  elementDefinition?: InternalSchemaElement;
  searchParams?: SearchParameter[];
}

/**
 * Returns the list of fields to display in the search table.
 * @param search - The search request definition.
 * @returns The list of fields to display.
 */
export function getFieldDefinitions(search: SearchRequest): SearchControlField[] {
  const resourceType = search.resourceType;
  const typeSchema = getDataType(resourceType);
  const searchParams = getSearchParameters(resourceType);
  const fields: SearchControlField[] = [];

  // 1) Get the list of field names
  // If the search request has specific fields, use them
  // Otherwise, use the default fields for the resource type
  let fieldNames = search.fields;
  if (!fieldNames) {
    if (resourceType === 'Bundle') {
      fieldNames = ['id', 'timestamp'];
    } else {
      fieldNames = ['id', 'meta.lastUpdated'];
      if (typeSchema) {
        addDefaultFields(typeSchema, fieldNames);
      }
    }
  }

  // 2) Convert field names to field definitions
  for (const name of fieldNames) {
    fields.push(getFieldDefinition(resourceType, name, typeSchema, searchParams));
  }

  return fields;
}

function addDefaultFields(
  typeSchema: InternalTypeSchema,
  fieldNames: string[]
): void {
  for (const [name, element] of Object.entries(typeSchema.elements)) {
    if (element.min && element.max && element.min > 0 && element.max > 0) {
        if (!fieldNames.includes(name)) {
            fieldNames.push(name);
        }
    }
  }
}

function getFieldDefinition(
    resourceType: string,
    name: string,
    typeSchema: InternalTypeSchema | undefined,
    searchParams: Record<string, SearchParameter> | undefined
): SearchControlField {
    let elementDefinition: InternalSchemaElement | undefined = undefined;
    if (typeSchema?.elements) {
        if (name in typeSchema.elements) {
            elementDefinition = typeSchema.elements[name];
        } else if (name.indexOf('.') > 0) {
             const parts = name.split('.');
             let current: InternalTypeSchema | undefined = typeSchema;
             for (let i = 0; i < parts.length; i++) {
                 const part = parts[i];
                 if (current?.elements?.[part]) {
                    const el: InternalSchemaElement = current.elements[part];
                    if (i === parts.length - 1) {
                         elementDefinition = el;
                    } else if (el.type) {
                         current = getDataType(el.type[0].code);
                    } else {
                         current = undefined;
                    }
                 } else {
                     break;
                 }
             }
        }
    }

    const fieldSearchParams: SearchParameter[] = [];
    if (searchParams) {
        // Exact match
        if (name in searchParams) {
             fieldSearchParams.push(searchParams[name]);
        }
        // Handle _id
        if (name === 'id' && '_id' in searchParams) {
            fieldSearchParams.push(searchParams['_id']);
        }
        // Check for "code" or "date" etc params that might map
        // This logic mimics core behavior roughly
        // Ideally we check paths but that matches multiple
    }

    return {
        name,
        elementDefinition,
        searchParams: fieldSearchParams.length > 0 ? fieldSearchParams : undefined
    };
}
