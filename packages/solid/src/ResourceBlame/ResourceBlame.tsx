// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Bundle, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourceName } from '../ResourceName/ResourceName';
import { blame } from '../utils/blame';
import { getTimeString, getVersionUrl } from './ResourceBlame.utils';

export interface ResourceBlameProps {
  readonly history?: Bundle;
  readonly resourceType?: ResourceType;
  readonly id?: string;
}

export function ResourceBlame(props: ResourceBlameProps): JSX.Element | null {
  const medplum = useMedplum();
  // Ensure reactivity for props.history by initializing signal, or just use props.history if it changes?
  // React implementation uses `useState(props.history)` and effects to update it.
  const [value, setValue] = createSignal<Bundle | undefined>(props.history);

  createEffect(() => {
     if (props.history) {
        setValue(props.history);
     } else if (props.resourceType && props.id) {
       medplum.readHistory(props.resourceType, props.id).then(setValue).catch(console.log);
     }
  });

  const resource = () => value()?.entry?.[0]?.resource as Resource;
  const table = () => (value() ? blame(value() as Bundle) : []);

  return (
    <Show when={value()} fallback={<div>Loading...</div>}>
      <div class="overflow-x-auto">
        <table class="table table-xs w-full">
          <tbody>
            <For each={table()}>
              {(row, index) => (
                <tr class={row.span > 0 ? 'border-t border-base-300' : ''}>
                  <Show when={row.span > 0}>
                    <td class="align-top whitespace-nowrap text-xs text-base-content/60" rowSpan={row.span}>
                      <ResourceName value={row.meta.author} link={true} />
                    </td>
                    <td class="align-top whitespace-nowrap text-xs text-base-content/60" rowSpan={row.span}>
                       <Show when={resource()}>
                         <MedplumLink to={getVersionUrl(resource(), row.meta.versionId as string)}>
                           {getTimeString(row.meta.lastUpdated as string)}
                         </MedplumLink>
                       </Show>
                    </td>
                  </Show>
                  <td class="align-top text-xs text-base-content/40 select-none w-8 text-right pr-2">{index() + 1}</td>
                  <td class="font-mono text-xs whitespace-pre-wrap">
                    {row.value}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </Show>
  );
}
