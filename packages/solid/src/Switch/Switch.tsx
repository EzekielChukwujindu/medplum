// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Switch as KobalteSwitch } from '@kobalte/core/switch';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export interface SwitchProps {
  /** Input name */
  readonly name?: string;
  /** Switch label */
  readonly label?: string;
  /** Whether checked */
  readonly checked?: boolean;
  /** Default checked */
  readonly defaultChecked?: boolean;
  /** Whether disabled */
  readonly disabled?: boolean;
  /** Callback when changed */
  readonly onChange?: (checked: boolean) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Switch component using Kobalte for accessibility.
 * Proper toggle switch with screen reader support.
 * @param props
 */
export function Switch(props: SwitchProps): JSX.Element {
  return (
    <KobalteSwitch
      checked={props.checked}
      defaultChecked={props.defaultChecked}
      disabled={props.disabled}
      onChange={props.onChange}
      class={`flex items-center gap-2 ${props.class ?? ''}`}
    >
      <KobalteSwitch.Input name={props.name} data-testid={props.testId} />
      <KobalteSwitch.Control class="toggle toggle-primary">
        <KobalteSwitch.Thumb />
      </KobalteSwitch.Control>
      <Show when={props.label}>
        <KobalteSwitch.Label class="label-text">{props.label}</KobalteSwitch.Label>
      </Show>
    </KobalteSwitch>
  );
}
