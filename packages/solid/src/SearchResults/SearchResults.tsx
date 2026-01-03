// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Bundle, Resource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show, createMemo } from 'solid-js';
import { Loading } from '../Loading/Loading';
import { MedplumLink } from '../MedplumLink/MedplumLink';

export interface SearchResultsProps {
  /** Search results bundle */
  readonly bundle?: Bundle;
  /** Whether loading */
  readonly loading?: boolean;
  /** Resource type being searched */
  readonly resourceType: string;
  /** Columns to display */
  readonly columns?: SearchResultColumn[];
  /** Click handler for row */
  readonly onRowClick?: (resource: Resource) => void;
  /** Whether to show links */
  readonly showLinks?: boolean;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

export interface SearchResultColumn {
  /** Column header label */
  label: string;
  /** Path to value (e.g., 'name', 'birthDate') */
  path: string;
  /** Custom render function */
  render?: (resource: Resource) => JSX.Element;
}

/**
 * SearchResults displays a table of FHIR search results.
 * This is a simpler component than the full SearchControl.
 * @param props
 */
export function SearchResults(props: SearchResultsProps): JSX.Element {
  const resources = createMemo(() => {
    if (!props.bundle?.entry) {return [];}
    return props.bundle.entry
      .filter((e) => e.resource)
      .map((e) => e.resource as Resource);
  });

  const columns = createMemo(() => {
    if (props.columns && props.columns.length > 0) {
      return props.columns;
    }
    // Default columns
    return [
      { label: 'ID', path: 'id' },
      { label: 'Last Updated', path: 'meta.lastUpdated' },
    ];
  });

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleRowClick = (resource: Resource): void => {
    props.onRowClick?.(resource);
  };

  return (
    <div class={`overflow-x-auto ${props.class ?? ''}`} data-testid={props.testId}>
      <Show when={props.loading}>
        <div class="flex justify-center p-8">
          <Loading />
        </div>
      </Show>

      <Show when={!props.loading && resources().length === 0}>
        <div class="text-center p-8 text-base-content/60">
          No results found
        </div>
      </Show>

      <Show when={!props.loading && resources().length > 0}>
        <table class="table table-zebra">
          <thead>
            <tr>
              <For each={columns()}>
                {(col) => <th>{col.label}</th>}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={resources()}>
              {(resource) => (
                <tr
                  class="hover cursor-pointer"
                  onClick={() => handleRowClick(resource)}
                >
                  <For each={columns()}>
                    {(col) => (
                      <td>
                        <Show
                          when={col.render}
                          fallback={
                            <Show
                              when={col.path === 'id' && props.showLinks}
                              fallback={<>{getNestedValue(resource, col.path) ?? ''}</>}
                            >
                              <MedplumLink to={resource}>
                                {resource.id}
                              </MedplumLink>
                            </Show>
                          }
                        >
                          {col.render?.(resource)}
                        </Show>
                      </td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </Show>

      <Show when={props.bundle?.total !== undefined}>
        <div class="text-sm text-base-content/60 mt-2">
          {props.bundle?.total} result{props.bundle?.total === 1 ? '' : 's'}
        </div>
      </Show>
    </div>
  );
}
