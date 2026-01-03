// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Reference, Resource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { formatDateTime } from '@medplum/core';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { ResourceName } from '../ResourceName/ResourceName';

export interface TimelineItemProps<T extends Resource = Resource> {
  /** The resource that created this item */
  readonly resource: T;
  /** Profile reference for avatar display */
  readonly profile?: { reference?: string } | string;
  /** Timestamp */
  readonly dateTime?: string;
  /** Optional icon */
  readonly icon?: JSX.Element;
  /** Item content */
  readonly children?: JSX.Element;
  /** Optional padding */
  readonly padding?: boolean;
  /** Optional CSS class */
  readonly class?: string;
  /** Optional menu items */
  readonly popupMenuItems?: JSX.Element;
}

/**
 * TimelineItem - a single item in a timeline.
 * @param props
 */
export function TimelineItem(props: TimelineItemProps): JSX.Element {
  // Use profile if provided, otherwise fall back to resource
  // Cast to Resource | Reference since that's what ResourceAvatar/ResourceName expect
  const avatarValue = () => {
    const profile = props.profile;
    if (profile) {
      if (typeof profile === 'string') {
        return { reference: profile } as Reference;
      }
      return profile as Reference;
    }
    return props.resource;
  };

  return (
    <li data-testid="timeline-item" class={props.class ?? ''}>
      <div class="timeline-start text-sm text-base-content/60">
        <Show when={props.dateTime}>
          {formatDateTime(props.dateTime)}
        </Show>
      </div>
      <div class="timeline-middle">
        <Show when={props.icon} fallback={
          <div class="w-3 h-3 rounded-full bg-primary" />
        }>
          {props.icon}
        </Show>
      </div>
      <div class="timeline-end timeline-box">
        <div class="flex items-center gap-2 mb-2">
          <ResourceAvatar value={avatarValue()} size="sm" />
          <ResourceName value={avatarValue()} link />
          <div class="flex-1" />
          {props.popupMenuItems}
        </div>
        <Show when={props.children}>
          <div classList={{ 'p-4': props.padding }}>{props.children}</div>
        </Show>
      </div>
      <hr />
    </li>
  );
}

export interface TimelineProps {
  /** Timeline items to display */
  readonly children: JSX.Element;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Timeline component using DaisyUI styling.
 * Container for TimelineItem components.
 * @param props
 */
export function Timeline(props: TimelineProps): JSX.Element {
  return (
    <ul
      class={`timeline timeline-vertical ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      {props.children}
    </ul>
  );
}
