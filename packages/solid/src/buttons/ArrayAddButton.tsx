// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { CirclePlus } from 'lucide-solid';
import type { JSX} from 'solid-js';
import { Show } from 'solid-js';

export interface ArrayAddButtonProps {
  readonly propertyDisplayName?: string;
  readonly onClick: (e: MouseEvent) => void;
  readonly testId?: string;
}

export function ArrayAddButton(props: ArrayAddButtonProps): JSX.Element {
  const text = () => (props.propertyDisplayName ? `Add ${props.propertyDisplayName}` : 'Add');

  return (
    <Show
      when={props.propertyDisplayName}
      fallback={
        <button
          class="btn btn-sm btn-ghost text-success"
          title={text()}
          data-testid={props.testId}
          onClick={props.onClick}
        >
           <CirclePlus class="h-5 w-5" />
        </button>
      }
    >
      <button
        class="btn btn-sm btn-ghost text-success gap-2"
        title={text()}
        data-testid={props.testId}
        onClick={props.onClick}
      >
        <CirclePlus class="h-5 w-5" />
        {text()}
      </button>
    </Show>
  );
}
