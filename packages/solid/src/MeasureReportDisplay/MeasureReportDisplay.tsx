// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { MeasureReport, MeasureReportGroup, Reference } from '@medplum/fhirtypes';
import { useResource, useSearchOne } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { MeasureReportGroupDisplay, MeasureTitle } from './MeasureReportGroupDisplay/MeasureReportGroupDisplay';

export interface MeasureReportDisplayProps {
  readonly measureReport: MeasureReport | Reference<MeasureReport>;
}

export function MeasureReportDisplay(props: MeasureReportDisplayProps): JSX.Element {
  const report = useResource(() => props.measureReport);
  // useSearchOne returns resource directly in solid-hooks? Or Accessor? It returns resource | null (or undefined).
  // Wait, useSearchOne in solid-hooks returns Accessor<T | undefined>.
  const [measure] = useSearchOne('Measure', () => ({ url: report()?.measure }));

  return (
    <Show when={report()}>
      <div>
        <Show when={measure()}>
          <MeasureTitle measure={measure()!} />
        </Show>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
          <For each={report()?.group}>
            {(group: MeasureReportGroup) => <MeasureReportGroupDisplay group={group} />}
          </For>
        </div>
      </div>
    </Show>
  );
}
