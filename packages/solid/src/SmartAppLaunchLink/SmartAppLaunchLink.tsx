// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { ensureTrailingSlash, locationUtils, normalizeErrorString } from '@medplum/core';
import type { ClientApplication, Encounter, Patient, Reference, SmartAppLaunch } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentProps } from 'solid-js';

export interface SmartAppLaunchLinkProps extends ParentProps {
  /** SMART client application */
  readonly client: ClientApplication;
  /** Patient context for launch */
  readonly patient?: Reference<Patient>;
  /** Encounter context for launch */
  readonly encounter?: Reference<Encounter>;
  /** CSS class */
  readonly class?: string;
}

/**
 * SmartAppLaunchLink creates a link that launches a SMART on FHIR app.
 * @param props
 */
export function SmartAppLaunchLink(props: SmartAppLaunchLinkProps): JSX.Element {
  const medplum = useMedplum();

  function launchApp(): void {
    medplum
      .createResource<SmartAppLaunch>({
        resourceType: 'SmartAppLaunch',
        patient: props.patient,
        encounter: props.encounter,
      })
      .then((result) => {
        const url = new URL(props.client.launchUri as string);
        url.searchParams.set('iss', ensureTrailingSlash(medplum.fhirUrl().toString()));
        url.searchParams.set('launch', result.id as string);
        locationUtils.assign(url.toString());
      })
      .catch((err) => {
        console.error('SMART app launch failed:', normalizeErrorString(err));
        // Could add toast notification here
      });
  }

  return (
    <a
      href="#"
      class={`link ${props.class ?? ''}`}
      onClick={(e) => {
        e.preventDefault();
        launchApp();
      }}
    >
      {props.children}
    </a>
  );
}
