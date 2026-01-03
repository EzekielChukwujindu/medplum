// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ContactDetail } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { ContactPointDisplay } from '../ContactPointDisplay/ContactPointDisplay';

export interface ContactDetailDisplayProps {
  /** ContactDetail value to display */
  readonly value?: ContactDetail;
}

/**
 * ContactDetailDisplay renders a ContactDetail with name and telecom info.
 * @param props
 */
export function ContactDetailDisplay(props: ContactDetailDisplayProps): JSX.Element | null {
  const contactDetail = () => props.value;

  return (
    <Show when={contactDetail()}>
      {(detail) => (
        <>
          {detail().name}
          <Show when={detail().name}>{': '}</Show>
          <For each={detail().telecom}>
            {(telecom) => (
              <ContactPointDisplay value={telecom} />
            )}
          </For>
        </>
      )}
    </Show>
  );
}
