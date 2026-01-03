// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome, Resource } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show, onMount } from 'solid-js';
import { FhirPathDisplay } from '../FhirPathDisplay/FhirPathDisplay';
import { Loading } from '../Loading/Loading';
import { isCheckboxCell, killEvent } from '../utils/dom';

export interface FhirPathTableField {
  readonly propertyType: string;
  readonly name: string;
  readonly fhirPath: string;
}

export interface FhirPathTableProps {
  readonly resourceType: string;
  readonly query: string;
  readonly fields: FhirPathTableField[];
  readonly checkboxesEnabled?: boolean;
  readonly onClick?: (e: SearchClickEvent) => void;
  readonly onAuxClick?: (e: SearchClickEvent) => void;
  readonly onBulk?: (ids: string[]) => void;
}

export interface SmartSearchResponse {
  readonly data: {
    ResourceList: Resource[];
  };
}

/**
 * SearchClickEvent represents a click event on a table row.
 */
export class SearchClickEvent {
  readonly resource: Resource;
  readonly browserEvent: MouseEvent;

  constructor(resource: Resource, browserEvent: MouseEvent) {
    this.resource = resource;
    this.browserEvent = browserEvent;
  }
}

/**
 * The FhirPathTable component represents the embeddable search table control.
 * @param props - FhirPathTable props.
 * @returns FhirPathTable JSX element.
 */
export function FhirPathTable(props: FhirPathTableProps): JSX.Element {
  const medplum = useMedplum();
  const [schemaLoaded, setSchemaLoaded] = createSignal(false);
  const [outcome, setOutcome] = createSignal<OperationOutcome | undefined>();
  const [response, setResponse] = createSignal<SmartSearchResponse | undefined>();
  const [selected, setSelected] = createSignal<{ [id: string]: boolean }>({});

  // Load schema on mount
  onMount(() => {
    medplum
      .requestSchema(props.resourceType)
      .then(() => setSchemaLoaded(true))
      .catch(console.log);
  });

  // Execute GraphQL query
  createEffect(() => {
    const query = props.query;
    setOutcome(undefined);
    medplum
      .graphql(query)
      .then(setResponse)
      .catch((err) => setOutcome(normalizeOperationOutcome(err)));
  });

  function handleSingleCheckboxClick(e: Event, id: string): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const currentSelected = selected();
    const newSelected = { ...currentSelected };
    if (checked) {
      newSelected[id] = true;
    } else {
      delete newSelected[id];
    }
    setSelected(newSelected);
  }

  function handleAllCheckboxClick(e: Event): void {
    e.stopPropagation();

    const el = e.target as HTMLInputElement;
    const checked = el.checked;
    const newSelected: { [id: string]: boolean } = {};
    const resources = response()?.data.ResourceList;
    if (checked && resources) {
      resources.forEach((resource) => {
        if (resource.id) {
          newSelected[resource.id] = true;
        }
      });
    }
    setSelected(newSelected);
  }

  function isAllSelected(): boolean {
    const resources = response()?.data.ResourceList;
    if (!resources || resources.length === 0) {
      return false;
    }
    const currentSelected = selected();
    for (const resource of resources) {
      if (resource.id && !currentSelected[resource.id]) {
        return false;
      }
    }
    return true;
  }

  function handleRowClick(e: MouseEvent, resource: Resource): void {
    if (isCheckboxCell(e.target as Element)) {
      // Ignore clicks on checkboxes
      return;
    }

    killEvent(e);

    if (e.button !== 1 && props.onClick) {
      props.onClick(new SearchClickEvent(resource, e));
    }

    if (e.button === 1 && props.onAuxClick) {
      props.onAuxClick(new SearchClickEvent(resource, e));
    }
  }

  return (
    <Show when={schemaLoaded()} fallback={<Loading />}>
      <div onContextMenu={(e) => killEvent(e)} data-testid="search-control">
        <table class="table table-zebra w-full">
          <thead>
            <tr>
              <Show when={props.checkboxesEnabled}>
                <th>
                  <input
                    type="checkbox"
                    class="checkbox"
                    value="checked"
                    aria-label="all-checkbox"
                    data-testid="all-checkbox"
                    checked={isAllSelected()}
                    onChange={(e) => handleAllCheckboxClick(e)}
                  />
                </th>
              </Show>
              <For each={props.fields}>
                {(field) => <th>{field.name}</th>}
              </For>
            </tr>
          </thead>
          <tbody>
            <For each={response()?.data.ResourceList}>
              {(resource) => (
                <Show when={resource}>
                  <tr
                    data-testid="search-control-row"
                    onClick={(e) => handleRowClick(e, resource)}
                    onAuxClick={(e) => handleRowClick(e, resource)}
                  >
                    <Show when={props.checkboxesEnabled}>
                      <td>
                        <input
                          type="checkbox"
                          class="checkbox"
                          value="checked"
                          data-testid="row-checkbox"
                          aria-label={`Checkbox for ${resource.id}`}
                          checked={!!selected()[resource.id as string]}
                          onChange={(e) => handleSingleCheckboxClick(e, resource.id as string)}
                        />
                      </td>
                    </Show>
                    <For each={props.fields}>
                      {(field) => (
                        <td>
                          <FhirPathDisplay
                            propertyType={field.propertyType}
                            path={field.fhirPath}
                            resource={resource}
                          />
                        </td>
                      )}
                    </For>
                  </tr>
                </Show>
              )}
            </For>
          </tbody>
        </table>

        <Show when={response()?.data.ResourceList.length === 0}>
          <div data-testid="empty-search">No results</div>
        </Show>

        <Show when={outcome()}>
          <div data-testid="search-error">
            <pre style={{ "text-align": "left" }}>{JSON.stringify(outcome(), undefined, 2)}</pre>
          </div>
        </Show>

        <Show when={props.onBulk}>
          <button
            class="btn btn-primary mt-2"
            onClick={() => props.onBulk?.(Object.keys(selected()))}
          >
            Bulk...
          </button>
        </Show>
      </div>
    </Show>
  );
}
