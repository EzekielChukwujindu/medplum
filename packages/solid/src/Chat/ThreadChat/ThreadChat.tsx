// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ProfileResource } from '@medplum/core';
import { createReference, formatCodeableConcept, getReferenceString } from '@medplum/core';
import type { Communication } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, on, Show } from 'solid-js';
import { BaseChat } from '../BaseChat/BaseChat';

export interface ThreadChatProps {
  readonly thread: Communication;
  readonly title?: string;
  readonly onMessageSent?: (message: Communication) => void;
  readonly inputDisabled?: boolean;
  readonly excludeHeader?: boolean;
  readonly onError?: (err: Error) => void;
}

export function ThreadChat(props: ThreadChatProps): JSX.Element | null {
  const medplum = useMedplum();
  // useMedplumProfile returns accessor in Solid hooks?
  // Checking @medplum/solid-hooks implementation: usually accessors or values.
  // Assuming it behaves like useMedplum (returns object). useMedplumProfile?
  // React hook returns object. Solid hook likely returns accessor or store.
  // In BaseChat: const [profile, setProfile] = createSignal(medplum.getProfile());
  // So likely useMedplum().getProfile() is used.
  // The hook useMedplumProfile acts as convenience.
  // Let's assume it returns value or accessor.
  // NOTE: BaseChat used medplum.getProfile().
  
  const [communications, setCommunications] = createSignal<Communication[]>([]);

  // Track thread ID change to clear communications
  createEffect(on(() => props.thread.id, () => {
    setCommunications([]);
  }));

  const profileRef = createMemo(() => {
    const profile = medplum.getProfile();
    return profile ? createReference(profile as ProfileResource) : undefined;
  });

  const threadRef = createMemo(() => createReference(props.thread));

  const sendMessage = (message: string): void => {
    const profileRefStr = profileRef() ? getReferenceString(profileRef()!) : undefined;
    if (!profileRefStr) {
      return;
    }

    const currentProfileRef = profileRef();

    medplum
      .createResource<Communication>({
        resourceType: 'Communication',
        status: 'in-progress',
        sender: currentProfileRef,
        recipient: props.thread.recipient?.filter((ref) => getReferenceString(ref) !== profileRefStr) ?? [],
        sent: new Date().toISOString(),
        payload: [{ contentString: message }],
        partOf: [threadRef()],
      })
      .then((communication) => {
        setCommunications([...communications(), communication]);
        props.onMessageSent?.(communication);
      })
      .catch(console.error);
  };

  const onMessageReceived = createMemo(() => {
    if (props.thread.recipient?.length === 2) {
      return (message: Communication): void => {
        if (!(message.received && message.status === 'completed')) {
          medplum
            .updateResource({
              ...message,
              received: message.received ?? new Date().toISOString(),
              status: 'completed',
            })
            .catch(console.error);
        }
      };
    }
    return undefined;
  });

  // Check if profile exists
  // In Solid we can just wrap in Show or check inside return
  const hasProfile = createMemo(() => !!medplum.getProfile());

  return (
    <Show when={hasProfile()}>
      <BaseChat
        title={props.title ?? (props.thread?.topic ? formatCodeableConcept(props.thread.topic) : '[No thread title]')}
        communications={communications()}
        setCommunications={setCommunications}
        query={`part-of=Communication/${props.thread.id as string}`}
        sendMessage={sendMessage}
        onMessageReceived={onMessageReceived()}
        inputDisabled={props.inputDisabled}
        excludeHeader={props.excludeHeader}
        onError={props.onError}
      />
    </Show>
  );
}
