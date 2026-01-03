// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export interface Step {
  /** Step title */
  title: string;
  /** Optional description */
  description?: string;
}

export interface StepsProps {
  /** Array of steps */
  readonly steps: Step[];
  /** Current step index (0-based) */
  readonly current?: number;
  /** Steps direction */
  readonly direction?: 'horizontal' | 'vertical';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Steps component using DaisyUI styling.
 * Shows progress through a multi-step process.
 * @param props
 */
export function Steps(props: StepsProps): JSX.Element {
  const current = props.current ?? 0;
  const directionClass = props.direction === 'vertical' ? 'steps-vertical' : '';

  return (
    <ul
      class={`steps ${directionClass} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <For each={props.steps}>
        {(step, index) => (
          <li
            class={`step ${index() <= current ? 'step-primary' : ''}`}
            data-content={index() < current ? '✓' : index() + 1}
          >
            <div>
              <span class="font-medium">{step.title}</span>
              <Show when={step.description}>
                <span class="block text-xs text-base-content/60">{step.description}</span>
              </Show>
            </div>
          </li>
        )}
      </For>
    </ul>
  );
}
