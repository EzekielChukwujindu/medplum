// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getPathDisplayName, isPopulated } from '@medplum/core';
import type { Attachment } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { AttachmentDisplay } from '../AttachmentDisplay/AttachmentDisplay';
import { DescriptionListEntry } from '../DescriptionList/DescriptionList';

export interface AttachmentArrayDisplayProps {
  /** Property path */
  readonly path?: string;
  /** Array of attachments to display */
  readonly values?: Attachment[];
  /** Maximum width for attachment displays */
  readonly maxWidth?: number;
  /** Whether to wrap in a DescriptionListEntry */
  readonly includeDescriptionListEntry?: boolean;
}

/**
 * AttachmentArrayDisplay renders a list of Attachment values.
 * @param props
 */
export function AttachmentArrayDisplay(props: AttachmentArrayDisplayProps): JSX.Element {
  const key = () => {
    if (props.includeDescriptionListEntry && isPopulated(props.path)) {
      return props.path!.split('.').pop() as string;
    }
    return '';
  };

  const content = () => (
    <For each={props.values}>
      {(attachment, index) => (
        <div>
          <AttachmentDisplay value={attachment} maxWidth={props.maxWidth} />
        </div>
      )}
    </For>
  );

  return (
    <Show
      when={props.includeDescriptionListEntry && key()}
      fallback={<>{content()}</>}
    >
      <DescriptionListEntry term={getPathDisplayName(key())}>
        {content()}
      </DescriptionListEntry>
    </Show>
  );
}
