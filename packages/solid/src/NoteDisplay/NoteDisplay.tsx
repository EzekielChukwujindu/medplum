// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Annotation } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export interface NoteDisplayProps {
  /** Array of Annotation values to display */
  readonly value?: Annotation[];
}

/**
 * NoteDisplay renders clinical notes/annotations as blockquotes.
 * @param props
 */
export function NoteDisplay(props: NoteDisplayProps): JSX.Element | null {
  return (
    <Show when={props.value && props.value.length > 0}>
      <div class="space-y-2">
        <For each={props.value}>
          {(note) => (
            <Show when={note.text}>
              <blockquote class="border-l-4 border-base-300 pl-4 py-2 italic">
                <p class="text-base-content">{note.text}</p>
                <Show when={note.authorReference?.display || note.authorString}>
                  <cite class="text-sm text-base-content/60 not-italic block mt-1">
                    — {note.authorReference?.display || note.authorString}
                  </cite>
                </Show>
                <Show when={note.time}>
                  <span class="text-xs text-base-content/40 block">
                    {new Date(note.time!).toLocaleString()}
                  </span>
                </Show>
              </blockquote>
            </Show>
          )}
        </For>
      </div>
    </Show>
  );
}
