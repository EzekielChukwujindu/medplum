// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { calculateAgeString, formatAddress, formatHumanName, resolveId } from '@medplum/core';
import type {
  AllergyIntolerance,
  Condition,
  Coverage,
  DiagnosticReport,
  HumanName,
  MedicationRequest,
  Observation,
  Patient,
  Reference,
  Resource,
  ServiceRequest,
} from '@medplum/fhirtypes';
import { useMedplum, useResource } from '@medplum/solid-hooks';
import { Cake, Heart, Languages, MapPin, Stethoscope, TreeDeciduous } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, For, Show } from 'solid-js';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';

export interface PatientSummaryProps {
  /** Patient resource or reference */
  readonly patient: Patient | Reference<Patient>;
  /** Callback when a resource is clicked */
  readonly onClickResource?: (resource: Resource) => void;
  /** Callback for lab requests */
  readonly onRequestLabs?: () => void;
}

interface PatientMedicalData {
  readonly allergies: AllergyIntolerance[];
  readonly problems: Condition[];
  readonly sexualOrientation?: Observation;
  readonly smokingStatus?: Observation;
  readonly vitals: Observation[];
  readonly medicationRequests: MedicationRequest[];
  readonly coverages: Coverage[];
  readonly serviceRequests: ServiceRequest[];
  readonly diagnosticReports: DiagnosticReport[];
}

/**
 * PatientSummary displays a comprehensive patient summary panel.
 * Includes demographics, allergies, conditions, medications, labs, vitals, and more.
 * @param props
 */
export function PatientSummary(props: PatientSummaryProps): JSX.Element | null {
  const medplum = useMedplum();
  const patient = useResource(props.patient as Reference<Patient>);
  const [medicalData, setMedicalData] = createSignal<PatientMedicalData | undefined>();
  const [createdDate, setCreatedDate] = createSignal<string | undefined>();

  createEffect(() => {
    const patientVal = patient();
    if (!patientVal) {return;}

    const id = resolveId(props.patient) as string;
    const ref = `Patient/${id}`;
    const searchMeta = { _count: 100, _sort: '-_lastUpdated' };

    Promise.all([
      medplum.searchResources('AllergyIntolerance', { patient: ref, ...searchMeta }),
      medplum.searchResources('Condition', { patient: ref, ...searchMeta }),
      medplum.searchResources('MedicationRequest', { subject: ref, ...searchMeta }),
      medplum.searchResources('Observation', { subject: ref, ...searchMeta }),
      medplum.searchResources('Coverage', { beneficiary: ref, ...searchMeta }),
      medplum.searchResources('ServiceRequest', { subject: ref, ...searchMeta }),
      medplum.searchResources('DiagnosticReport', { subject: ref, ...searchMeta }),
    ])
      .then((results) => {
        const observations = results[3];
        setMedicalData({
          allergies: results[0],
          problems: results[1],
          medicationRequests: results[2],
          sexualOrientation: observations.find((obs) => obs.code?.coding?.[0].code === '76690-7'),
          smokingStatus: observations.find((obs) => obs.code?.coding?.[0].code === '72166-2'),
          vitals: observations.filter((obs) => obs.category?.[0]?.coding?.[0].code === 'vital-signs'),
          coverages: results[4],
          serviceRequests: results[5],
          diagnosticReports: results[6],
        });
      })
      .catch(console.error);
  });

  createEffect(() => {
    const patientVal = patient();
    if (patientVal?.id) {
      medplum
        .readHistory('Patient', patientVal.id)
        .then((history) => {
          const firstEntry = history.entry?.[history.entry.length - 1];
          const lastUpdated = firstEntry?.resource?.meta?.lastUpdated;
          setCreatedDate(typeof lastUpdated === 'string' ? lastUpdated : '');
        })
        .catch(() => {});
    }
  });

  return (
    <Show when={patient()} fallback={<div class="loading loading-spinner loading-lg" />}>
      {(p) => (
        <div class="flex flex-col gap-2 w-full bg-base-100 border rounded-lg overflow-hidden">
          {/* Patient header */}
          <div
            class="cursor-pointer hover:bg-base-200 transition-colors"
            onClick={() => props.onClickResource?.(p())}
          >
            <div class="flex items-center gap-3 p-4">
              <ResourceAvatar value={p()} size="lg" />
              <div class="flex-1 min-w-0">
                <p class="text-lg font-bold truncate">
                  {formatHumanName(p().name?.[0] as HumanName)}
                </p>
                <Show when={createdDate()}>
                  {(date) => {
                    const d = new Date(date());
                    return (
                      <p class="text-xs text-base-content/60 truncate">
                        Patient since {d.getMonth() + 1}/{d.getDate()}/{d.getFullYear()}
                      </p>
                    );
                  }}
                </Show>
              </div>
            </div>
            <div class="divider my-0" />
          </div>

          {/* Patient info items */}
          <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            <Show when={medicalData()}>
              {(data) => (
                <>
                  {/* Demographics */}
                  <div class="space-y-2 py-2">
                   {(() => {
                      const birthDate = p().birthDate;
                      return (
                        <PatientInfoItem
                          icon={<Cake class="w-4 h-4" />}
                          label="Birthdate & Age"
                          value={birthDate ? `${birthDate} (${calculateAgeString(birthDate)})` : undefined}
                          placeholder="Add Birthdate"
                        />
                      );
                    })()}
                    <PatientInfoItem
                      icon={<Heart class="w-4 h-4" />}
                      label="Gender"
                      value={p().gender}
                      placeholder="Add Gender"
                    />
                    <PatientInfoItem
                      icon={<TreeDeciduous class="w-4 h-4" />}
                      label="Race & Ethnicity"
                      value={undefined}
                      placeholder="Add Race & Ethnicity"
                    />
                    <PatientInfoItem
                      icon={<MapPin class="w-4 h-4" />}
                      label="Location"
                      value={p().address?.[0] ? formatAddress(p().address![0]) : undefined}
                      placeholder="Add Location"
                    />
                    <PatientInfoItem
                      icon={<Languages class="w-4 h-4" />}
                      label="Language"
                      value={p().communication?.[0]?.language?.text}
                      placeholder="Add Language"
                    />
                    <PatientInfoItem
                      icon={<Stethoscope class="w-4 h-4" />}
                      label="General Practitioner"
                      value={p().generalPractitioner?.[0]?.display}
                      placeholder="Add General Practitioner"
                    />
                  </div>

                  <div class="divider my-1" />

                  {/* Insurance */}
                  <CollapsibleSection title="Insurance" count={data().coverages.length}>
                    <For each={data().coverages}>
                      {(coverage) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded"
                          onClick={() => props.onClickResource?.(coverage)}
                        >
                          {coverage.payor?.[0]?.display ?? 'Unknown Payor'}
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>

                  <div class="divider my-1" />

                  {/* Allergies */}
                  <CollapsibleSection title="Allergies" count={data().allergies.length}>
                    <For each={data().allergies}>
                      {(allergy) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded"
                          onClick={() => props.onClickResource?.(allergy)}
                        >
                          {allergy.code?.text ?? allergy.code?.coding?.[0]?.display ?? 'Unknown'}
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>

                  <div class="divider my-1" />

                  {/* Problems */}
                  <CollapsibleSection title="Problem List" count={data().problems.length}>
                    <For each={data().problems}>
                      {(condition) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded"
                          onClick={() => props.onClickResource?.(condition)}
                        >
                          {condition.code?.text ?? condition.code?.coding?.[0]?.display ?? 'Unknown'}
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>

                  <div class="divider my-1" />

                  {/* Medications */}
                  <CollapsibleSection title="Medications" count={data().medicationRequests.length}>
                    <For each={data().medicationRequests}>
                      {(med) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded"
                          onClick={() => props.onClickResource?.(med)}
                        >
                          {med.medicationCodeableConcept?.text ?? 
                           med.medicationCodeableConcept?.coding?.[0]?.display ?? 
                           'Unknown Medication'}
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>

                  <div class="divider my-1" />

                  {/* Labs */}
                  <CollapsibleSection title="Labs" count={data().diagnosticReports.length}>
                    <Show when={props.onRequestLabs}>
                      <button type="button" class="btn btn-sm btn-outline mb-2" onClick={props.onRequestLabs}>
                        Request Labs
                      </button>
                    </Show>
                    <For each={data().diagnosticReports}>
                      {(report) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded"
                          onClick={() => props.onClickResource?.(report)}
                        >
                          {report.code?.text ?? report.code?.coding?.[0]?.display ?? 'Unknown Report'}
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>

                  <div class="divider my-1" />

                  {/* Vitals */}
                  <CollapsibleSection title="Vitals" count={data().vitals.length}>
                    <For each={data().vitals.slice(0, 5)}>
                      {(vital) => (
                        <div
                          class="text-sm cursor-pointer hover:bg-base-200 p-2 rounded flex justify-between"
                          onClick={() => props.onClickResource?.(vital)}
                        >
                          <span>{vital.code?.text ?? vital.code?.coding?.[0]?.display}</span>
                          <span class="font-medium">
                            {vital.valueQuantity?.value} {vital.valueQuantity?.unit}
                          </span>
                        </div>
                      )}
                    </For>
                  </CollapsibleSection>
                </>
              )}
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
}

// Sub-components

interface PatientInfoItemProps {
  readonly icon: JSX.Element;
  readonly label: string;
  readonly value?: string;
  readonly placeholder: string;
}

function PatientInfoItem(props: PatientInfoItemProps): JSX.Element {
  return (
    <div class="flex items-center gap-3">
      <div class="text-base-content/60">{props.icon}</div>
      <div class="flex-1 min-w-0">
        <p class="text-xs text-base-content/60">{props.label}</p>
        <Show when={props.value} fallback={<p class="text-sm text-base-content/40">{props.placeholder}</p>}>
          <p class="text-sm truncate">{props.value}</p>
        </Show>
      </div>
    </div>
  );
}

interface CollapsibleSectionProps {
  readonly title: string;
  readonly count: number;
  readonly children: JSX.Element;
}

function CollapsibleSection(props: CollapsibleSectionProps): JSX.Element {
  const [isOpen, setIsOpen] = createSignal(false);

  return (
    <div class="collapse collapse-arrow bg-base-200/50">
      <input type="checkbox" checked={isOpen()} onChange={(e) => setIsOpen(e.currentTarget.checked)} />
      <div class="collapse-title text-sm font-medium flex items-center gap-2 py-2 min-h-0">
        {props.title}
        <span class="badge badge-sm">{props.count}</span>
      </div>
      <div class="collapse-content">
        <Show when={props.count === 0} fallback={props.children}>
          <p class="text-sm text-base-content/50 py-2">No {props.title.toLowerCase()} recorded</p>
        </Show>
      </div>
    </div>
  );
}
