// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime, normalizeErrorString } from '@medplum/core';
import type { Bundle, BundleEntry, Resource, ResourceType } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourceBadge } from '../ResourceBadge/ResourceBadge';

export interface ResourceHistoryTableProps {
  /** Pre-loaded history bundle */
  readonly history?: Bundle;
  /** Resource type to load history for */
  readonly resourceType?: string;
  /** Resource ID to load history for */
  readonly id?: string;
}

/**
 * ResourceHistoryTable displays version history for a FHIR resource.
 * @param props
 */
export function ResourceHistoryTable(props: ResourceHistoryTableProps): JSX.Element {
  const medplum = useMedplum();
  const [value, setValue] = createSignal<Bundle | undefined>(props.history);

  createEffect(() => {
    if (!props.history && props.resourceType && props.id) {
      medplum
        .readHistory(props.resourceType as ResourceType, props.id)
        .then(setValue)
        .catch(console.log);
    }
  });

  return (
    <Show when={value()} fallback={<div>Loading...</div>}>
      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Author</th>
              <th>Date</th>
              <th>Version</th>
            </tr>
          </thead>
          <tbody>
            <For each={value()?.entry}>
              {(entry) => <HistoryRow entry={entry} />}
            </For>
          </tbody>
        </table>
      </div>
    </Show>
  );
}

interface HistoryRowProps {
  readonly entry: BundleEntry;
}

function HistoryRow(props: HistoryRowProps): JSX.Element {
  const { response, resource } = props.entry;
  
  return (
    <Show
      when={resource}
      fallback={
        <tr>
          <td colSpan={3}>{normalizeErrorString(response?.outcome)}</td>
        </tr>
      }
    >
      {(res) => (
        <tr>
          <td>
            <ResourceBadge value={res().meta?.author} link />
          </td>
          <td>{formatDateTime(res().meta?.lastUpdated)}</td>
          <td>
            <MedplumLink to={getVersionUrl(res())}>
              {res().meta?.versionId}
            </MedplumLink>
          </td>
        </tr>
      )}
    </Show>
  );
}

function getVersionUrl(resource: Resource): string {
  return `/${resource.resourceType}/${resource.id}/_history/${resource.meta?.versionId}`;
}
