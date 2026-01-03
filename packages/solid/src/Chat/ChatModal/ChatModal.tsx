// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ProfileResource } from '@medplum/core';
import { useMedplumProfile } from '@medplum/solid-hooks';
import { ChevronDown, ChevronUp } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';

export interface ChatModalProps {
  readonly open?: boolean;
  readonly children: JSX.Element;
}

export function ChatModal(props: ChatModalProps): JSX.Element | null {
  const profile = useMedplumProfile() as unknown as () => ProfileResource | undefined;
  const [opened, setOpened] = createSignal(props.open ?? false);

  createEffect(() => {
    if (props.open !== undefined) {
      setOpened(props.open);
    }
  });

  return (
    <Show when={profile()}>
      <Show when={opened()}>
        <div class="fixed bottom-20 right-6 w-96 h-[32rem] bg-base-100 shadow-xl rounded-box z-50 flex flex-col border border-base-300">
          {props.children}
        </div>
      </Show>
      <div class="fixed bottom-6 right-6 z-50">
        <button
          class="btn btn-circle btn-primary btn-lg shadow-lg"
          onClick={() => setOpened(!opened())}
          aria-label={opened() ? 'Close chat' : 'Open chat'}
        >
          <Show when={opened()} fallback={<ChevronUp class="w-8 h-8" />}>
            <ChevronDown class="w-8 h-8" />
          </Show>
        </button>
      </div>
    </Show>
  );
}
