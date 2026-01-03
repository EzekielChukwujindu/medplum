// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { deepClone, getSearchParameters, Operator } from '@medplum/core';
import type { Filter, SearchRequest } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { Form } from '../Form/Form';
import { Modal as SolidModal } from '../Modal/Modal'; 
import { NativeSelect } from '../NativeSelect/NativeSelect';
import { SearchFilterValueInput } from '../SearchFilterValueInput/SearchFilterValueInput';
import {
  addFilter,
  buildFieldNameString,
  deleteFilter,
  getOpString,
  getSearchOperators,
  setFilters,
} from '../SearchControl/SearchUtils';

// Note: I will use Button for ArrayAddButton equivalent
import { Button } from '../Button/Button';

// Icons
// I'll assume usage of strings or svg if icons not available, or check if @tabler/icons-react is used? 
// Solid package uses heroicons or similar? Or maybe passed as props?
// React uses @tabler/icons-react. 
// I'll check if I can use generic text or simple svg.
// Or I can import from where other components get icons.
// Assuming text "X" for delete for now or standard char.

export interface SearchFilterEditorProps {
  readonly visible: boolean;
  readonly search: SearchRequest;
  readonly onOk: (search: SearchRequest) => void;
  readonly onCancel: () => void;
}

export function SearchFilterEditor(props: SearchFilterEditorProps): JSX.Element | null {
  const [search, setSearch] = createSignal<SearchRequest>(deepClone(props.search));

  createEffect(() => {
    // When prop changes, reset state
    // Note: this effect runs when props.search changes
    setSearch(deepClone(props.search));
  });

  function onAddFilter(filter: Filter): void {
    setSearch(addFilter(search(), filter.code, filter.operator, filter.value));
  }

  const resourceType = () => props.search.resourceType;
  const searchParams = () => getSearchParameters(resourceType()) ?? {};
  const filters = () => search().filters || [];

  return (
    <SolidModal
      title="Filters"
      open={props.visible}
      onClose={props.onCancel}
    >
      <Form onSubmit={() => props.onOk(search())}>
        <div>
          <table class="table w-full">
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '30%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr>
                <th>Field</th>
                <th>Operation</th>
                <th>Value</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <For each={filters()}>
                {(filter, index) => (
                  <FilterRowInput
                    id={`filter-${index()}-row`}
                    resourceType={resourceType()}
                    searchParams={searchParams()}
                    value={filter}
                    onChange={(newFilter: Filter) => {
                      const newFilters = [...filters()];
                      newFilters[index()] = newFilter;
                      setSearch(setFilters(search(), newFilters));
                    }}
                    onDelete={() => setSearch(deleteFilter(search(), index()))}
                  />
                )}
              </For>
            </tbody>
          </table>
          <div class="mt-2">
            <Button variant="outline" onClick={() => onAddFilter({} as Filter)} type="button">
              Add Filter
            </Button>
          </div>
        </div>
        <div class="modal-action">
          <Button type="submit" variant="primary">OK</Button>
        </div>
      </Form>
    </SolidModal>
  );
}

interface FilterRowInputProps {
  readonly id: string;
  readonly resourceType: string;
  readonly searchParams: Record<string, SearchParameter>;
  readonly value: Filter;
  readonly onChange: (value: Filter) => void;
  readonly onDelete?: () => void;
}

function FilterRowInput(props: FilterRowInputProps): JSX.Element {
  // We don't use useRef in Solid, we just use props.value as source of truth for rendering
  // and call props.onChange for updates.

  function setFilterCode(newCode: string): void {
    props.onChange({
      ...props.value,
      code: newCode,
      operator: Operator.EQUALS,
      value: '',
    });
  }

  function setFilterOperator(newOperator: Operator): void {
    props.onChange({
      ...props.value,
      operator: newOperator,
      value: '',
    });
  }

  function setFilterValue(newFilterValue: string): void {
    props.onChange({
      ...props.value,
      value: newFilterValue,
    });
  }

  const searchParam = () => props.searchParams[props.value.code];
  const operators = () => {
    const sp = searchParam();
    return sp && getSearchOperators(sp);
  };

  return (
    <tr>
      <td>
        <NativeSelect
          testId={`${props.id}-filter-field`}
          defaultValue={props.value.code}
          onChange={(v) => setFilterCode(v)}
          data={[
            '',
            ...Object.keys(props.searchParams).map((param) => ({ value: param, label: buildFieldNameString(param) })),
          ]}
        />
      </td>
      <td>
        <Show when={operators()}>
          <NativeSelect
            testId={`${props.id}-filter-operation`}
            defaultValue={props.value.operator}
            onChange={(v) => setFilterOperator(v as Operator)}
            data={['', ...operators()!.map((op) => ({ value: op, label: getOpString(op) }))]}
          />
        </Show>
      </td>
      <td>
        <Show when={searchParam() && props.value.operator}>
          <SearchFilterValueInput
            name={`${props.id}-filter-value`}
            resourceType={props.resourceType}
            searchParam={searchParam()!}
            defaultValue={props.value.value}
            onChange={setFilterValue}
          />
        </Show>
      </td>
      <td>
        <Show when={props.onDelete}>
          <button
            type="button"
            class="btn btn-ghost btn-circle btn-sm text-error"
            aria-label="Delete filter"
            onClick={props.onDelete}
          >
            ✕
          </button>
        </Show>
      </td>
    </tr>
  );
}
