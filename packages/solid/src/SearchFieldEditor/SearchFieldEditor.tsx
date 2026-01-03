// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalTypeSchema, SearchRequest } from '@medplum/core';
import { getDataType, getSearchParameters, sortStringArray } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import type { JSX } from 'solid-js';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { buildFieldNameString } from '../SearchControl/SearchUtils';

export interface SearchFieldEditorProps {
  readonly visible: boolean;
  readonly search: SearchRequest;
  readonly onOk: (search: SearchRequest) => void;
  readonly onCancel: () => void;
}

export function SearchFieldEditor(props: SearchFieldEditorProps): JSX.Element {
  const [selected, setSelected] = createSignal<string[]>([]);
  const [filter, setFilter] = createSignal('');

  createEffect(() => {
    if (props.visible) {
      setSelected(props.search.fields ?? []);
      setFilter('');
    }
  });

  const allFields = createMemo(() => {
    if (!props.visible) {
      return [];
    }
    const resourceType = props.search.resourceType;
    const typeSchema = getDataType(resourceType);
    const searchParams = getSearchParameters(resourceType);
    return sortStringArray(getFieldsList(typeSchema, searchParams)).map((field) => ({
      value: field,
      label: buildFieldNameString(field),
    }));
  });

  const filteredFields = createMemo(() => {
    const f = filter().toLowerCase();
    return allFields().filter((item) => item.label.toLowerCase().includes(f));
  });

  function toggleField(field: string): void {
    const current = selected();
    if (current.includes(field)) {
      setSelected(current.filter((f) => f !== field));
    } else {
      setSelected([...current, field]);
    }
  }

  function handleOk(): void {
    props.onOk({
      ...props.search,
      fields: selected(),
    });
  }

  return (
    <Modal title="Fields" open={props.visible} onClose={props.onCancel}>
      <div class="flex flex-col gap-4">
        {/* Selected Fields Chips */}
        <div class="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border border-base-300 rounded bg-base-100">
           <Show when={selected().length === 0}>
              <span class="text-base-content/50 italic text-sm p-1">No fields selected</span>
           </Show>
          <For each={selected()}>
            {(field) => (
              <span class="badge badge-primary gap-1">
                {buildFieldNameString(field)}
                <button
                  type="button"
                  class="btn btn-ghost btn-xs btn-circle text-primary-content"
                  onClick={() => toggleField(field)}
                  aria-label={`Remove ${field}`}
                >
                  ✕
                </button>
              </span>
            )}
          </For>
        </div>

        {/* Filter Input */}
        <input
          type="text"
          placeholder="Search fields..."
          class="input input-bordered w-full"
          value={filter()}
          onInput={(e) => setFilter(e.currentTarget.value)}
        />

        {/* Fields List */}
        <div class="h-64 overflow-y-auto border border-base-300 rounded p-2">
          <For each={filteredFields()}>
            {(item) => (
              <label class="label cursor-pointer justify-start gap-2 hover:bg-base-200 rounded p-1">
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  checked={selected().includes(item.value)}
                  onChange={() => toggleField(item.value)}
                  aria-label={item.label}
                />
                <span class="label-text">{item.label}</span>
              </label>
            )}
          </For>
        </div>

        <div class="modal-action">
          <Button onClick={handleOk}>OK</Button>
        </div>
      </div>
    </Modal>
  );
}

function getFieldsList(
  typeSchema: InternalTypeSchema,
  searchParams: Record<string, SearchParameter> | undefined
): string[] {
  const result: string[] = [];
  const keys = new Set<string>();
  const names = new Set<string>();

  // Add properties first
  if (typeSchema?.elements) {
    for (const key of Object.keys(typeSchema.elements)) {
      result.push(key);
      keys.add(key.toLowerCase());
      names.add(buildFieldNameString(key));
    }
  }

  // Add search parameters if unique
  if (searchParams) {
    for (const code of Object.keys(searchParams)) {
      const name = buildFieldNameString(code);
      if (!keys.has(code) && !names.has(name)) {
        result.push(code);
        keys.add(code);
        names.add(name);
      }
    }
  }

  return result;
}
