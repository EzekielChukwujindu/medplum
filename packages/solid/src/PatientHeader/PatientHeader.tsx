// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { calculateAgeString } from '@medplum/core';
import type { Patient, Reference } from '@medplum/fhirtypes';
import { useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { HumanNameDisplay } from '../HumanNameDisplay/HumanNameDisplay';
import { InfoBar } from '../InfoBar/InfoBar';
import { MedplumLink } from '../MedplumLink/MedplumLink';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';

export interface PatientHeaderProps {
  /** Patient resource or reference */
  readonly patient: Patient | Reference<Patient>;
}

/**
 * PatientHeader displays a summary banner with patient demographics.
 * @param props
 */
export function PatientHeader(props: PatientHeaderProps): JSX.Element | null {
  const patient = useResource(props.patient as Reference<Patient>);

  return (
    <Show when={patient()}>
      {(p) => (
        <InfoBar>
          <ResourceAvatar value={p()} size="lg" />
          
          <InfoBar.Entry>
            <InfoBar.Key>Name</InfoBar.Key>
            <InfoBar.Value>
              <MedplumLink to={p()} class="font-medium">
                <Show when={p().name?.[0]} fallback="[blank]">
                  {(name) => <HumanNameDisplay value={name()} options={{ use: false }} />}
                </Show>
              </MedplumLink>
            </InfoBar.Value>
          </InfoBar.Entry>

          <Show when={p().birthDate}>
            <InfoBar.Entry>
              <InfoBar.Key>DoB</InfoBar.Key>
              <InfoBar.Value>{p().birthDate}</InfoBar.Value>
            </InfoBar.Entry>
            <InfoBar.Entry>
              <InfoBar.Key>Age</InfoBar.Key>
              <InfoBar.Value>{calculateAgeString(p().birthDate!)}</InfoBar.Value>
            </InfoBar.Entry>
          </Show>

          <Show when={p().gender}>
            <InfoBar.Entry>
              <InfoBar.Key>Gender</InfoBar.Key>
              <InfoBar.Value>{p().gender}</InfoBar.Value>
            </InfoBar.Entry>
          </Show>

          <Show when={p().address?.[0]?.state}>
            <InfoBar.Entry>
              <InfoBar.Key>State</InfoBar.Key>
              <InfoBar.Value>{p().address![0].state}</InfoBar.Value>
            </InfoBar.Entry>
          </Show>

          <For each={p().identifier}>
            {(identifier) => (
              <InfoBar.Entry>
                <InfoBar.Key>{identifier?.system}</InfoBar.Key>
                <InfoBar.Value>{identifier?.value}</InfoBar.Value>
              </InfoBar.Entry>
            )}
          </For>
        </InfoBar>
      )}
    </Show>
  );
}
