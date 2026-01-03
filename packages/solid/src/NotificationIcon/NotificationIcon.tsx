// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ResourceType } from '@medplum/fhirtypes';
import { useMedplum, useSubscription } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';
import { Tooltip } from '../Tooltip/Tooltip';

export interface NotificationIconProps {
  /** Icon component to display */
  readonly iconComponent: JSX.Element;
  /** Accessibility label */
  readonly label?: string;
  /** Tooltip text */
  readonly tooltip?: string;
  /** Resource type to count */
  readonly resourceType: ResourceType;
  /** Search criteria for counting */
  readonly countCriteria: string;
  /** Subscription criteria for real-time updates */
  readonly subscriptionCriteria: string;
  /** Click handler */
  readonly onClick?: () => void;
}

/**
 * NotificationIcon displays an icon with a badge showing unread count.
 * Uses subscriptions for real-time updates.
 * @param props
 */
export function NotificationIcon(props: NotificationIconProps): JSX.Element {
  const medplum = useMedplum();
  const [unreadCount, setUnreadCount] = createSignal(0);

  function updateCount(cache: 'default' | 'reload'): void {
    medplum
      .search(props.resourceType, props.countCriteria, { cache })
      .then((result) => setUnreadCount(result.total as number))
      .catch(console.error);
  }

  // Initial count
  createEffect(() => {
    // Cache=default to use the default cache policy, and accept most recent data
    updateCount('default');
  });

  // Subscribe to the criteria
  useSubscription(props.subscriptionCriteria, () => {
    // Cache=reload to force a reload
    updateCount('reload');
  });

  // Build the icon component with optional wrappers
  const iconWithClick = () => (
    <Show
      when={props.onClick}
      fallback={props.iconComponent}
    >
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle"
        aria-label={props.label}
        onClick={props.onClick}
      >
        {props.iconComponent}
      </button>
    </Show>
  );

  const iconWithTooltip = () => (
    <Show when={props.tooltip} fallback={iconWithClick()}>
      <Tooltip label={props.tooltip!}>
        {iconWithClick()}
      </Tooltip>
    </Show>
  );

  return (
    <div class="relative inline-flex">
      {iconWithTooltip()}
      <Show when={unreadCount() > 0}>
        <span class="absolute -bottom-1 -right-1 bg-error text-error-content text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-semibold">
          {unreadCount().toLocaleString()}
        </span>
      </Show>
    </div>
  );
}
