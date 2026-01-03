// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime, getReferenceString } from '@medplum/core';
import type { Bundle, BundleEntry, Reference, RequestGroup, Resource, Task } from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal, createEffect, For, Show } from 'solid-js';
import { ResourceName } from '../ResourceName/ResourceName';
import { StatusBadge } from '../StatusBadge/StatusBadge';
import { Button } from '../Button/Button';

export interface RequestGroupDisplayProps {
  readonly value?: RequestGroup | Reference<RequestGroup>;
  readonly onStart: (task: Task, input: Reference) => void;
  readonly onEdit: (task: Task, input: Reference, output: Reference) => void;
}

export function RequestGroupDisplay(props: RequestGroupDisplayProps): JSX.Element | null {
  const medplum = useMedplum();
  const requestGroup = useResource(() => props.value);
  const [responseBundle, setResponseBundle] = createSignal<Bundle>();

  createEffect(() => {
    const rg = requestGroup();
    if (rg) {
      const batch = buildBatchRequest(rg);
      if (batch.entry && batch.entry.length > 0) {
        medplum.executeBatch(batch).then(setResponseBundle).catch(console.error);
      }
    }
  });

  // Derived Accessor for actions to simplify template
  // However, simple derivation inside template is fine.

  return (
    <Show when={requestGroup() && responseBundle()}>
      <div class="grid grid-cols-12 gap-4">
        <For each={requestGroup()?.action}>
          {(action) => {
            const task = () => action.resource && findBundleEntry(action.resource as Reference<Task>, responseBundle());
            const taskInput = () => task()?.input?.[0]?.valueReference;
            const taskOutput = () => task()?.output?.[0]?.valueReference;

            return (
              <>
                <div class="col-span-1 p-4 flex items-center justify-center">
                  <Show
                    when={task()?.status === 'completed'}
                    fallback={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="text-gray-500"
                      >
                        <rect width="18" height="18" x="3" y="3" rx="2" />
                      </svg>
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-primary"
                    >
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      <line x1="9" x2="21" y1="12" y2="12" />
                    </svg>
                    {/* Wait, the icon above (checkbox) logic: 
                        If completed: Checkbox (checked).
                        If incomplete: Square.
                        The first SVG is Square.
                        The second SVG matches Checkbox (roughly).
                        Actually Tabler icons usage in React: IconCheckbox vs IconSquare.
                    */}
                     {/* Using simplified SVGs or lucide-solid if available. Tabler icons were used in React. */}
                  </Show>
                </div>
                <div class="col-span-9 p-2">
                  <div class="font-medium">{action.title}</div>
                  <Show when={action.description}>
                    <div>{action.description}</div>
                  </Show>
                  <div>
                    Last edited by&nbsp;
                    <ResourceName value={task()?.meta?.author as Reference} />
                    &nbsp;on&nbsp;
                    {formatDateTime(task()?.meta?.lastUpdated)}
                  </div>
                  <div>
                    Status: <StatusBadge status={task()?.status || 'unknown'} />
                  </div>
                </div>
                <div class="col-span-2 p-4 flex items-center justify-center gap-2">
                  <Show when={taskInput() && !taskOutput()}>
                    <Button variant="primary" onClick={() => props.onStart(task()!, taskInput()!)}>
                      Start
                    </Button>
                  </Show>
                  <Show when={taskInput() && taskOutput()}>
                    <Button variant="primary" onClick={() => props.onEdit(task()!, taskInput()!, taskOutput()!)}>
                      Edit
                    </Button>
                  </Show>
                </div>
              </>
            );
          }}
        </For>
      </div>
    </Show>
  );
}

function buildBatchRequest(request: RequestGroup): Bundle {
  const batchEntries: BundleEntry[] = [];
  if (request.action) {
    for (const action of request.action) {
      if (action.resource?.reference) {
        batchEntries.push({ request: { method: 'GET', url: action.resource.reference } });
      }
    }
  }

  return {
    resourceType: 'Bundle',
    type: 'batch',
    entry: batchEntries,
  };
}

function findBundleEntry<T extends Resource>(reference: Reference<T>, bundle?: Bundle): T | undefined {
  if (!bundle?.entry) {
    return undefined;
  }
  for (const entry of bundle.entry) {
    if (entry.resource && reference.reference === getReferenceString(entry.resource)) {
      return entry.resource as T;
    }
  }
  return undefined;
}
