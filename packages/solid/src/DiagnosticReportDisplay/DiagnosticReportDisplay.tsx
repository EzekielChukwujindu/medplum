// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatDateTime, formatObservationValue } from '@medplum/core';
import type {
  Annotation,
  DiagnosticReport,
  Observation,
  ObservationReferenceRange,
  Reference,
  Specimen,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { CodeableConceptDisplay } from '../CodeableConceptDisplay/CodeableConceptDisplay';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { NoteDisplay } from '../NoteDisplay/NoteDisplay';
import { RangeDisplay } from '../RangeDisplay/RangeDisplay';
import { ReferenceDisplay } from '../ReferenceDisplay/ReferenceDisplay';
import { ResourceBadge } from '../ResourceBadge/ResourceBadge';
import { StatusBadge } from '../StatusBadge/StatusBadge';

export interface DiagnosticReportDisplayProps {
  /** DiagnosticReport resource or reference */
  readonly value?: DiagnosticReport | Reference<DiagnosticReport>;
  /** Hide observation notes */
  readonly hideObservationNotes?: boolean;
  /** Hide specimen information */
  readonly hideSpecimenInfo?: boolean;
  /** Hide subject information */
  readonly hideSubject?: boolean;
}

/**
 * DiagnosticReportDisplay renders lab results and diagnostic reports.
 * @param props
 */
export function DiagnosticReportDisplay(props: DiagnosticReportDisplayProps): JSX.Element | null {
  const medplum = useMedplum();
  const diagnosticReport = useResource(props.value as Reference<DiagnosticReport>);
  const [specimens, setSpecimens] = createSignal<Specimen[]>([]);

  createEffect(() => {
    const dr = diagnosticReport();
    if (dr?.specimen) {
      Promise.allSettled(dr.specimen.map((ref) => medplum.readReference(ref)))
        .then((outcomes) =>
          outcomes
            .filter((outcome) => outcome.status === 'fulfilled')
            .map((outcome) => (outcome as PromiseFulfilledResult<Specimen>).value)
        )
        .then(setSpecimens)
        .catch(console.error);
    }
  });

  const specimenNotes = (): Annotation[] => {
    const notes: Annotation[] = specimens().flatMap((spec) => spec.note || []);
    const dr = diagnosticReport();
    if (dr?.presentedForm && dr.presentedForm.length > 0) {
      const pf = dr.presentedForm[0];
      if (pf.contentType?.startsWith('text/plain') && pf.data) {
        notes.push({ text: window.atob(pf.data) });
      }
    }
    return notes;
  };

  return (
    <Show when={diagnosticReport()}>
      {(dr) => (
        <div class="space-y-4">
          <h2 class="text-2xl font-bold">Diagnostic Report</h2>
          
          <DiagnosticReportHeader value={dr()} hideSubject={props.hideSubject} />
          
          <Show when={specimens().length > 0 && !props.hideSpecimenInfo}>
            <SpecimenInfo specimens={specimens()} />
          </Show>
          
          <Show when={dr().result}>
            <ObservationTable 
              value={dr().result} 
              hideObservationNotes={props.hideObservationNotes} 
            />
          </Show>
          
          <Show when={specimenNotes().length > 0}>
            <NoteDisplay value={specimenNotes()} />
          </Show>
        </div>
      )}
    </Show>
  );
}

interface DiagnosticReportHeaderProps {
  readonly value: DiagnosticReport;
  readonly hideSubject?: boolean;
}

function DiagnosticReportHeader(props: DiagnosticReportHeaderProps): JSX.Element {
  return (
    <div class="flex flex-wrap gap-6 mt-4">
      <Show when={props.value.subject && !props.hideSubject}>
        <div>
          <div class="text-xs uppercase text-base-content/60">Subject</div>
          <ResourceBadge value={props.value.subject} link />
        </div>
      </Show>

      <For each={props.value.resultsInterpreter}>
        {(interpreter) => (
          <div>
            <div class="text-xs uppercase text-base-content/60">Interpreter</div>
            <ResourceBadge value={interpreter} link />
          </div>
        )}
      </For>

      <For each={props.value.performer}>
        {(performer) => (
          <div>
            <div class="text-xs uppercase text-base-content/60">Performer</div>
            <ResourceBadge value={performer} link />
          </div>
        )}
      </For>

      <Show when={props.value.issued}>
        <div>
          <div class="text-xs uppercase text-base-content/60">Issued</div>
          <div>{formatDateTime(props.value.issued)}</div>
        </div>
      </Show>

      <Show when={props.value.status}>
        <div>
          <div class="text-xs uppercase text-base-content/60">Status</div>
          <StatusBadge status={props.value.status!} />
        </div>
      </Show>
    </div>
  );
}

interface SpecimenInfoProps {
  readonly specimens: Specimen[];
}

function SpecimenInfo(props: SpecimenInfoProps): JSX.Element {
  return (
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">Specimens</h3>
      <ol class="list-decimal list-inside space-y-1">
        <For each={props.specimens}>
          {(specimen) => (
            <li>
              <span class="font-medium">Collected:</span> {formatDateTime(specimen.collection?.collectedDateTime)}
              <span class="ml-4 font-medium">Received:</span> {formatDateTime(specimen.receivedTime)}
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}

export interface ObservationTableProps {
  readonly value?: Observation[] | Reference<Observation>[];
  readonly ancestorIds?: string[];
  readonly hideObservationNotes?: boolean;
}

export function ObservationTable(props: ObservationTableProps): JSX.Element {
  return (
    <div class="overflow-x-auto">
      <table class="table table-compact">
        <thead>
          <tr>
            <th>Test</th>
            <th>Value</th>
            <th>Reference Range</th>
            <th>Interpretation</th>
            <th>Category</th>
            <th>Performer</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <ObservationRowGroup
            value={props.value}
            ancestorIds={props.ancestorIds}
            hideObservationNotes={props.hideObservationNotes}
          />
        </tbody>
      </table>
    </div>
  );
}

function ObservationRowGroup(props: ObservationTableProps): JSX.Element {
  return (
    <For each={props.value}>
      {(observation) => (
        <ObservationRow
          value={observation}
          ancestorIds={props.ancestorIds}
          hideObservationNotes={props.hideObservationNotes}
        />
      )}
    </For>
  );
}

interface ObservationRowProps {
  readonly value: Observation | Reference<Observation>;
  readonly ancestorIds?: string[];
  readonly hideObservationNotes?: boolean;
}

function ObservationRow(props: ObservationRowProps): JSX.Element | null {
  const observation = useResource(props.value as Reference<Observation>);

  const isCritical = (): boolean => {
    const obs = observation();
    const code = obs?.interpretation?.[0]?.coding?.[0]?.code;
    return code === 'AA' || code === 'LL' || code === 'HH' || code === 'A';
  };

  const obs = () => observation();
  const shouldRender = () => obs() && !props.ancestorIds?.includes(obs()!.id as string);
  const displayNotes = () => !props.hideObservationNotes && obs()?.note;

  return (
    <Show when={shouldRender()}>
      <>
        <tr class={isCritical() ? 'bg-error/10' : ''}>
          <td rowSpan={displayNotes() ? 2 : 1}>
            <MedplumLink to={obs()}>
              <CodeableConceptDisplay value={obs()?.code} />
            </MedplumLink>
          </td>
          <td>{formatObservationValue(obs())}</td>
          <td>
            <ReferenceRangeDisplay value={obs()?.referenceRange} />
          </td>
          <td>
            <Show when={obs()?.interpretation?.[0]}>
              <CodeableConceptDisplay value={obs()!.interpretation![0]} />
            </Show>
          </td>
          <td>
            <For each={obs()?.category}>
              {(concept) => (
                <div>
                  <CodeableConceptDisplay value={concept} />
                </div>
              )}
            </For>
          </td>
          <td>
            <For each={obs()?.performer}>
              {(performer) => <ReferenceDisplay value={performer} />}
            </For>
          </td>
          <td>
            <Show when={obs()?.status}>
              <StatusBadge status={obs()!.status!} />
            </Show>
          </td>
        </tr>
        <Show when={obs()?.hasMember}>
          <ObservationRowGroup
            value={obs()!.hasMember as Reference<Observation>[]}
            ancestorIds={
              props.ancestorIds
                ? [...props.ancestorIds, obs()!.id as string]
                : [obs()!.id as string]
            }
            hideObservationNotes={props.hideObservationNotes}
          />
        </Show>
        <Show when={displayNotes()}>
          <tr>
            <td colSpan={6}>
              <NoteDisplay value={obs()?.note} />
            </td>
          </tr>
        </Show>
      </>
    </Show>
  );
}

interface ReferenceRangeProps {
  readonly value?: ObservationReferenceRange[];
}

function ReferenceRangeDisplay(props: ReferenceRangeProps): JSX.Element | null {
  const range = () => props.value && props.value.length > 0 ? props.value[0] : null;
  
  return (
    <Show when={range()}>
      {(r) => (
        <Show when={r().text} fallback={<RangeDisplay value={r()} />}>
          <>{r().text}</>
        </Show>
      )}
    </Show>
  );
}
