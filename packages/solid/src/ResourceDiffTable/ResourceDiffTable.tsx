// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalSchemaElement, TypedValue } from '@medplum/core';
import { arrayify, capitalize, evalFhirPathTyped, getSearchParameterDetails, toTypedValue } from '@medplum/core';
import type { Resource, SearchParameter } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import type { Operation } from 'rfc6902';
import { createPatch } from 'rfc6902';
import { ResourceDiffRow } from '../ResourceDiffRow/ResourceDiffRow';

export interface ResourceDiffTableProps {
  /** Original resource to compare from */
  readonly original: Resource;
  /** Revised resource to compare to */
  readonly revised: Resource;
}

interface DiffTableRow {
  key: string;
  name: string;
  path: string;
  property: InternalSchemaElement | undefined;
  originalValue: TypedValue | undefined;
  revisedValue: TypedValue | undefined;
}

/**
 * ResourceDiffTable displays a comparison table showing the differences
 * between two versions of a resource.
 * @param props
 */
export function ResourceDiffTable(props: ResourceDiffTableProps): JSX.Element | null {
  const medplum = useMedplum();
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);

  createEffect(() => {
    medplum
      .requestSchema(props.original.resourceType)
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  });

  const diffTable = createMemo((): DiffTableRow[] | null => {
    if (!schemaLoaded()) {
      return null;
    }

    const typedOriginal = [toTypedValue(props.original)];
    const typedRevised = [toTypedValue(props.revised)];
    const result: DiffTableRow[] = [];

    // First, we filter and consolidate the patch operations
    // We can do this because we do not use the "value" field in the patch operations
    // Remove patch operations on meta elements such as "meta.lastUpdated" and "meta.versionId"
    // Consolidate patch operations on arrays
    const patch = mergePatchOperations(createPatch(props.original, props.revised));

    // Next, convert the patch operations to a diff table
    for (const op of patch) {
      const path = op.path;
      const fhirPath = jsonPathToFhirPath(path);
      const property = tryGetElementDefinition(props.original.resourceType, fhirPath);
      const originalValue = op.op === 'add' ? undefined : evalFhirPathTyped(fhirPath, typedOriginal);
      const revisedValue = op.op === 'remove' ? undefined : evalFhirPathTyped(fhirPath, typedRevised);
      result.push({
        key: `op-${op.op}-${op.path}`,
        name: `${capitalize(op.op)} ${fhirPath}`,
        path: property?.path ?? props.original.resourceType + '.' + fhirPath,
        property: property,
        originalValue: touchUpValue(property, originalValue),
        revisedValue: touchUpValue(property, revisedValue),
      });
    }

    return result;
  });

  return (
    <Show when={diffTable()} fallback={<div class="loading loading-spinner loading-sm" />}>
      {(table) => (
        <div class="overflow-x-auto">
          <table class="table table-zebra">
            <thead>
              <tr>
                <th>Property</th>
                <th>Before</th>
                <th>After</th>
              </tr>
            </thead>
            <tbody>
              <For each={table()}>
                {(row) => (
                  <ResourceDiffRow
                    name={row.name}
                    path={row.path}
                    property={row.property}
                    originalValue={row.originalValue}
                    revisedValue={row.revisedValue}
                  />
                )}
              </For>
            </tbody>
          </table>
        </div>
      )}
    </Show>
  );
}

/**
 * Merge patch operations to consolidate array operations and filter out meta fields.
 * @param patch
 */
function mergePatchOperations(patch: Operation[]): Operation[] {
  const result: Operation[] = [];
  for (const patchOperation of patch) {
    const { op, path } = patchOperation;
    if (
      path.startsWith('/meta/author') ||
      path.startsWith('/meta/compartment') ||
      path.startsWith('/meta/lastUpdated') ||
      path.startsWith('/meta/versionId')
    ) {
      continue;
    }
    const count = patch.filter((el) => el.op === op && el.path === path).length;
    const resultOperation = { op, path } as Operation;
    if (count > 1 && (op === 'add' || op === 'remove') && /\/[0-9-]+$/.test(path)) {
      // Remove everything after the last slash
      resultOperation.op = 'replace';
      resultOperation.path = path.replace(/\/[^/]+$/, '');
    }
    if (!result.some((el) => el.op === resultOperation.op && el.path === resultOperation.path)) {
      // Only add the operation if it doesn't already exist
      result.push(resultOperation);
    }
  }
  return result;
}

/**
 * Convert JSON Pointer path to FHIR path.
 * @param path
 */
function jsonPathToFhirPath(path: string): string {
  const parts = path.split('/').filter(Boolean);
  let result = '';
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === '-') {
      result += '.last()';
    } else if (/^\d+$/.test(part)) {
      result += `[${part}]`;
    } else {
      if (i > 0) {
        result += '.';
      }
      result += part;
    }
  }

  // For attachments, remove the .url suffix
  // Note that not all ".url" properties are attachments, but it is the common case.
  // If the property is not an attachment, the diff will simply render the parent element,
  // which is still fine.
  if (result.endsWith('.url')) {
    result = result.replace(/\.url$/, '');
  }

  return result;
}

/**
 * Try to get the element definition for a FHIR path.
 * @param resourceType
 * @param fhirPath
 */
function tryGetElementDefinition(resourceType: string, fhirPath: string): InternalSchemaElement | undefined {
  try {
    const details = getSearchParameterDetails(resourceType, {
      resourceType: 'SearchParameter',
      base: [resourceType],
      code: resourceType + '.' + fhirPath,
      expression: resourceType + '.' + fhirPath,
    } as SearchParameter);
    return details?.elementDefinitions?.[0];
  } catch (err) {
    console.warn('Failed to get element definition', { resourceType, fhirPath, err });
    return undefined;
  }
}

/**
 * Fix up the value for display, handling arrays and single values.
 * @param property
 * @param input
 */
function touchUpValue(
  property: InternalSchemaElement | undefined,
  input: TypedValue[] | TypedValue | undefined
): TypedValue | undefined {
  if (!input) {
    return input;
  }
  return {
    type: Array.isArray(input) ? input[0].type : input.type,
    value: fixArray(input, !!property?.isArray),
  };
}

/**
 * Fix array handling based on property definition.
 * @param input
 * @param isArray
 */
function fixArray(input: TypedValue[] | TypedValue, isArray: boolean): unknown {
  const inputValue = arrayify(input).flatMap((v) => v.value);
  return isArray ? inputValue : inputValue[0];
}
