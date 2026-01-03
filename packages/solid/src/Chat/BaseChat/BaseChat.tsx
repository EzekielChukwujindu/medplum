// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ProfileResource, WithId } from '@medplum/core';
import { getDisplayString, getReferenceString, normalizeErrorString } from '@medplum/core';
import type { Bundle, Communication, Reference } from '@medplum/fhirtypes';
import { useMedplum, useResource, useSubscription } from '@medplum/solid-hooks';
import { ArrowRight } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, For, Show } from 'solid-js';
import { Form } from '../../Form/Form';
import { ResourceAvatar } from '../../ResourceAvatar/ResourceAvatar';

function parseSentTime(communication: Communication): string {
  return new Date(communication.sent ?? 0).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function upsertCommunications(
  communications: Communication[],
  received: Communication[],
  setCommunications: (communications: Communication[]) => void
): void {
  const newCommunications = [...communications];
  let foundNew = false;
  for (const comm of received) {
    const existingIdx = newCommunications.findIndex((c) => c.id === comm.id);
    if (existingIdx !== -1) {
      newCommunications[existingIdx] = comm;
    } else {
      newCommunications.push(comm);
      foundNew = true;
    }
  }

  if (foundNew) {
    newCommunications.sort((a, b) => {
      if (!a.sent && !b.sent) {return 0;}
      if (!a.sent) {return -1;}
      if (!b.sent) {return 1;}
      return (a.sent as string).localeCompare(b.sent as string);
    });
  }

  setCommunications(newCommunications);
}

export interface BaseChatProps {
  /** Chat title */
  readonly title: string;
  /** Current communications to display */
  readonly communications: Communication[];
  /** Function to update communications */
  readonly setCommunications: (communications: Communication[]) => void;
  /** Search query for communications */
  readonly query: string;
  /** Function to send a message */
  readonly sendMessage: (content: string) => void;
  /** Callback when message is received */
  readonly onMessageReceived?: (message: Communication) => void;
  /** Callback when message is updated */
  readonly onMessageUpdated?: (message: Communication) => void;
  /** Disable input */
  readonly inputDisabled?: boolean;
  /** Hide header */
  readonly excludeHeader?: boolean;
  /** Error callback */
  readonly onError?: (err: Error) => void;
  /** Additional class name */
  readonly class?: string;
}

/**
 * BaseChat component for displaying and managing communications.
 * Provides real-time chat with subscription support.
 * @param props
 */
export function BaseChat(props: BaseChatProps): JSX.Element | null {
  const medplum = useMedplum();
  const [profile, setProfile] = createSignal(medplum.getProfile());
  const [loading, setLoading] = createSignal(true);
  const [reconnecting, setReconnecting] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  let scrollAreaRef: HTMLDivElement | undefined;

  const profileRefStr = createMemo(() => 
    profile() ? getReferenceString(medplum.getProfile() as WithId<ProfileResource>) : ''
  );

  async function searchMessages(): Promise<void> {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams(props.query);
      searchParams.append('_sort', '-sent');
      searchParams.append('sent:missing', 'false');
      const searchResult = await medplum.searchResources('Communication', searchParams, { cache: 'no-cache' });
      upsertCommunications(props.communications, searchResult, props.setCommunications);
    } catch (err) {
      console.error('Failed to search messages:', normalizeErrorString(err));
    }
    setLoading(false);
  }

  createEffect(() => {
    searchMessages();
  });

  // Subscribe for real-time updates
  useSubscription(
    `Communication?${props.query}`,
    (bundle: Bundle) => {
      const communication = bundle.entry?.[1]?.resource as Communication;
      upsertCommunications(props.communications, [communication], props.setCommunications);
      
      if (getReferenceString(communication.sender as Reference) === profileRefStr()) {
        return;
      }
      
      if (props.communications.find((c) => c.id === communication.id)) {
        props.onMessageUpdated?.(communication);
      } else {
        props.onMessageReceived?.(communication);
      }
    },
    {
      onWebSocketClose: () => {
        if (!reconnecting()) {
          setReconnecting(true);
        }
      },
      onWebSocketOpen: () => {
        if (reconnecting()) {
          searchMessages();
          setReconnecting(false);
        }
      },
      onError: (err: Error) => {
        if (props.onError) {
          props.onError(err);
        } else {
          console.error('Chat error:', normalizeErrorString(err));
        }
      },
    }
  );

  function sendMessageInternal(formData: Record<string, string>): void {
    if (props.inputDisabled) {return;}
    if (inputRef) {
      inputRef.value = '';
    }
    props.sendMessage(formData.message);
    // Scroll to bottom after sending
    setTimeout(() => {
      if (scrollAreaRef) {
        scrollAreaRef.scrollTop = scrollAreaRef.scrollHeight;
      }
    }, 100);
  }

  // Profile change check
  createEffect(() => {
    const latestProfile = medplum.getProfile();
    if (profile()?.id !== latestProfile?.id) {
      setProfile(latestProfile);
      props.setCommunications([]);
    }
  });

  // Scroll to bottom on new messages
  createEffect(() => {
    if (props.communications.length && scrollAreaRef) {
      scrollAreaRef.scrollTop = scrollAreaRef.scrollHeight;
    }
  });

  const myLastDeliveredId = createMemo(() => {
    let i = props.communications.length;
    while (i--) {
      const comm = props.communications[i];
      if (comm.sender?.reference === profileRefStr() && comm.received) {
        return comm.id as string;
      }
    }
    return '';
  });

  return (
    <Show when={profile()}>
      <div class={`card bg-base-100 shadow-lg flex flex-col h-full ${props.class ?? ''}`}>
        {/* Header */}
        <Show when={!props.excludeHeader}>
          <div class="card-title p-4 border-b">
            <h2 class="text-xl font-bold">{props.title}</h2>
          </div>
        </Show>

        {/* Chat body */}
        <div class="flex-1 relative overflow-hidden">
          <Show when={loading() || reconnecting()}>
            <div class="absolute inset-0 bg-base-100/80 flex items-center justify-center z-10">
              <span class="loading loading-spinner loading-lg" />
            </div>
          </Show>

          <div 
            ref={scrollAreaRef} 
            class="h-full overflow-y-auto p-4 space-y-4"
          >
            <For each={props.communications}>
              {(comm, i) => {
                const prevComm = i() > 0 ? props.communications[i() - 1] : undefined;
                const prevTime = prevComm ? parseSentTime(prevComm) : undefined;
                const currTime = parseSentTime(comm);
                const isMyMessage = comm.sender?.reference === profileRefStr();
                const showDelivered = !!comm.received && comm.id === myLastDeliveredId();

                return (
                  <div class="space-y-2">
                    {/* Date separator */}
                    <Show when={!prevTime || currTime !== prevTime}>
                      <div class="text-center text-xs text-base-content/60 py-2">
                        {currTime}
                      </div>
                    </Show>

                    {/* Message bubble */}
                    <div class={`flex items-end gap-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                      <Show when={!isMyMessage}>
                        <ResourceAvatar value={comm.sender} size="sm" />
                      </Show>
                      
                      <ChatBubble 
                        communication={comm} 
                        alignment={isMyMessage ? 'right' : 'left'} 
                        showDelivered={showDelivered} 
                      />
                      
                      <Show when={isMyMessage}>
                        <ResourceAvatar value={comm.sender} size="sm" />
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </div>

        {/* Input */}
        <div class="p-4 border-t">
          <Form onSubmit={sendMessageInternal}>
            <div class="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                name="message"
                class="input input-bordered flex-1 rounded-full"
                placeholder={!props.inputDisabled ? 'Type a message...' : 'Replies are disabled'}
                disabled={props.inputDisabled}
              />
              <Show when={!props.inputDisabled}>
                <button
                  type="submit"
                  class="btn btn-primary btn-circle"
                  aria-label="Send message"
                >
                  <ArrowRight class="w-5 h-5" />
                </button>
              </Show>
            </div>
          </Form>
        </div>
      </div>
    </Show>
  );
}

interface ChatBubbleProps {
  readonly communication: Communication;
  readonly alignment: 'left' | 'right';
  readonly showDelivered?: boolean;
}

function ChatBubble(props: ChatBubbleProps): JSX.Element {
  const content = () => props.communication.payload?.[0]?.contentString || '';
  const sentTime = () => new Date(props.communication.sent ?? -1);
  const seenTime = () => new Date(props.communication.received ?? -1);
  const senderResource = useResource(props.communication.sender as Reference);

  return (
    <div class="flex flex-col max-w-[70%]">
      {/* Sender name and time */}
      <div class={`flex items-center gap-1 mb-1 text-xs ${props.alignment === 'right' ? 'justify-end' : ''}`}>
        <span class="font-medium">
          {senderResource() ? getDisplayString(senderResource()!) : '[Unknown]'}
        </span>
        <span class="text-base-content/50">·</span>
        <span class="text-base-content/50">
          {Number.isNaN(sentTime().getTime())
            ? ''
            : sentTime().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </span>
      </div>

      {/* Message bubble */}
      <div
        class={`p-3 rounded-2xl ${
          props.alignment === 'right'
            ? 'bg-primary text-primary-content rounded-br-sm'
            : 'bg-base-200 rounded-bl-sm'
        }`}
      >
        {content()}
      </div>

      {/* Delivered indicator */}
      <Show when={props.showDelivered}>
        <div class="text-xs text-base-content/50 text-right mt-1">
          Delivered {seenTime().getHours()}:{seenTime().getMinutes().toString().padStart(2, '0')}
        </div>
      </Show>
    </div>
  );
}
