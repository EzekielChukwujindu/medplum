// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Filter, SearchRequest } from '@medplum/core';
import type { Resource } from '@medplum/fhirtypes';
import { useMedplumNavigate, useSearch } from '@medplum/solid-hooks';
import {
  Columns,
  FilePlus,
  Filter as FilterIcon,
  SlidersHorizontal,
} from 'lucide-solid';
import type { JSX } from 'solid-js';
import { For, Show, createMemo, createSignal, createEffect } from 'solid-js';
import { Pagination } from '../Pagination/Pagination';
import { SearchFieldEditor } from '../SearchFieldEditor/SearchFieldEditor';
import { SearchFilterEditor } from '../SearchFilterEditor/SearchFilterEditor';
import { SearchFilterValueDialog } from '../SearchFilterValueDialog/SearchFilterValueDialog';
import { SearchPopupMenu } from '../SearchPopupMenu/SearchPopupMenu';
import { Loading } from '../Loading/Loading';
import { getFieldDefinitions } from './SearchControlField';
import {
  addFilter,
  buildFieldNameString,
  renderValue,
  setPage,
} from '../SearchControl/SearchUtils';

export interface SearchControlProps {
  readonly search: SearchRequest;
  readonly hideToolbar?: boolean;
  readonly hideFilters?: boolean;
  readonly onChange?: (search: SearchRequest) => void;
  readonly onClick?: (resource: Resource) => void;
  readonly onNew?: () => void;
  readonly class?: string;
  readonly testId?: string;
}

export function SearchControl(props: SearchControlProps): JSX.Element {
  const navigate = useMedplumNavigate();
  const [search, setSearch] = createSignal<SearchRequest>(props.search);
  
  // Dialog visibility states
  const [fieldEditorVisible, setFieldEditorVisible] = createSignal(false);
  const [filterEditorVisible, setFilterEditorVisible] = createSignal(false);
  const [filterDialogVisible, setFilterDialogVisible] = createSignal(false);
  
  // Filter Dialog State
  const [filterDialogState, setFilterDialogState] = createSignal<{
    searchParam?: any;
    filter?: Filter;
  }>({});

  createEffect(() => {
    setSearch(props.search);
  });

  const [bundle, loading, error] = useSearch(
    () => search().resourceType,
    () => search() as unknown as Record<string, string | number | boolean | undefined>
  );

  const fields = createMemo(() => getFieldDefinitions(search()));

  const resources = createMemo(() => {
    const b = bundle();
    if (!b?.entry) {return [];}
    return b.entry.map((e) => e.resource as Resource);
  });

  const totalPages = createMemo(() => {
    const b = bundle();
    if (!b?.total) {return 1;}
    const count = search().count ?? 20;
    return Math.ceil(b.total / count);
  });

  const currentPage = createMemo(() => {
    const offset = search().offset ?? 0;
    const count = search().count ?? 20;
    return Math.floor(offset / count) + 1;
  });

  const handleSearchChange = (newSearch: SearchRequest) => {
    setSearch(newSearch);
    props.onChange?.(newSearch);
  };

  const handlePageChange = (page: number) => {
    handleSearchChange(setPage(search(), page));
  };

  const handleRowClick = (resource: Resource) => {
    if (props.onClick) {props.onClick(resource);}
    else {navigate(`/${resource.resourceType}/${resource.id}`);}
  };

  return (
    <div class={`flex flex-col gap-4 ${props.class ?? ''}`} data-testid={props.testId}>
      {/* Dialogs */}
      <SearchFieldEditor
         visible={fieldEditorVisible()}
         search={search()}
         onOk={(s) => {
             handleSearchChange(s);
             setFieldEditorVisible(false);
         }}
         onCancel={() => setFieldEditorVisible(false)}
      />
      <SearchFilterEditor
         visible={filterEditorVisible()}
         search={search()}
         onOk={(s) => {
             handleSearchChange(s);
             setFilterEditorVisible(false);
         }}
         onCancel={() => setFilterEditorVisible(false)}
      />
       <SearchFilterValueDialog
            visible={filterDialogVisible()}
            title={filterDialogState().searchParam?.code ? buildFieldNameString(filterDialogState().searchParam?.code) : ''}
            resourceType={search().resourceType}
            searchParam={filterDialogState().searchParam}
            filter={filterDialogState().filter}
            onOk={(filter) => {
                 handleSearchChange(addFilter(search(), filter.code, filter.operator, filter.value));
                 setFilterDialogVisible(false);
            }}
            onCancel={() => setFilterDialogVisible(false)}
       />

      {/* Toolbar */}
      <Show when={!props.hideToolbar}>
        <div class="flex justify-between items-center">
            <div class="flex gap-2">
                <button type="button" class="btn btn-sm btn-ghost" onClick={() => setFieldEditorVisible(true)}>
                    <Columns class="w-4 h-4 mr-2"/> Fields
                </button>
                <button type="button" class="btn btn-sm btn-ghost" onClick={() => setFilterEditorVisible(true)}>
                    <FilterIcon class="w-4 h-4 mr-2"/> Filters
                    <Show when={(search().filters?.length ?? 0) > 0}>
                        <span class="badge badge-sm badge-secondary ml-1">{search().filters?.length}</span>
                    </Show>
                </button>
                <Show when={props.onNew}>
                    <button type="button" class="btn btn-sm btn-ghost" onClick={props.onNew}>
                        <FilePlus class="w-4 h-4 mr-2"/> New
                    </button>
                </Show>
            </div>
            <div class="flex gap-2">
                 {/* Refresh feature removed - useSearch doesn't expose refresh */}
            </div>
        </div>
      </Show>

      {/* Error State */}
      <Show when={error()}>
        <div class="alert alert-error">
           <span>Error: {JSON.stringify(error())}</span>
        </div>
      </Show>

      {/* Table */}
      <div class="overflow-x-auto border border-base-300 rounded-box">
          <table class="table table-zebra w-full">
              <thead>
                  <tr>
                      <For each={fields()}>
                          {(field) => (
                              <th>
                                  <div class="dropdown dropdown-bottom dropdown-end">
                                      <div tabindex="0" role="button" class="flex items-center gap-1 cursor-pointer hover:bg-base-200 px-2 py-1 rounded">
                                          {buildFieldNameString(field.name)}
                                          <SlidersHorizontal class="w-3 h-3 opacity-50"/>
                                      </div>
                                      <div tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                          <SearchPopupMenu
                                              search={search()}
                                              searchParams={field.searchParams}
                                              onPrompt={(sp, filter) => {
                                                  // Close dropdown - tricky in pure CSS/Solid without ref. 
                                                  // Often click outside handles it.
                                                  // Or we manually blur active element?
                                                  if (document.activeElement instanceof HTMLElement) {
                                                      document.activeElement.blur();
                                                  }
                                                  setFilterDialogState({ searchParam: sp, filter });
                                                  setFilterDialogVisible(true);
                                              }}
                                              onChange={handleSearchChange}
                                          />
                                      </div>
                                  </div>
                              </th>
                          )}
                      </For>
                  </tr>
              </thead>
              <tbody>
                  <Show when={loading()}>
                      <tr>
                          <td colspan={fields().length}>
                              <div class="flex justify-center p-4"><Loading/></div>
                          </td>
                      </tr>
                  </Show>
                  <Show when={!loading() && resources().length === 0}>
                      <tr>
                          <td colspan={fields().length}>
                              <div class="text-center p-4 text-base-content/60">No results found</div>
                          </td>
                      </tr>
                  </Show>
                  <For each={resources()}>
                      {(resource) => (
                          <tr class="hover cursor-pointer" onClick={() => handleRowClick(resource)}>
                              <For each={fields()}>
                                  {(field) => (
                                      <td>{renderValue(resource, field)}</td>
                                  )}
                              </For>
                          </tr>
                      )}
                  </For>
              </tbody>
          </table>
      </div>

      {/* Pagination */}
      <Show when={totalPages() > 1}>
          <div class="flex justify-center">
              <Pagination
                  page={currentPage()}
                  totalPages={totalPages()}
                  onChange={handlePageChange}
              />
          </div>
      </Show>
    </div>
  );
}
