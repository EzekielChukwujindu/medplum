// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  /** Image source URL */
  readonly src?: string;
  /** Alt text for image */
  readonly alt?: string;
  /** Fallback text (initials) when no image */
  readonly fallback?: string;
  /** Avatar size */
  readonly size?: AvatarSize;
  /** Whether avatar is rounded (circle) */
  readonly rounded?: boolean;
  /** Additional CSS class */
  readonly class?: string;
  /** Online/offline status indicator */
  readonly status?: 'online' | 'offline';
  /** Test ID */
  readonly testId?: string;
}

/**
 * Avatar component using DaisyUI styling.
 * Shows image or fallback initials.
 * @param props
 */
export function Avatar(props: AvatarProps): JSX.Element {
  const sizeClass = (): string => {
    switch (props.size) {
      case 'xs': return 'w-8';
      case 'sm': return 'w-10';
      case 'lg': return 'w-16';
      case 'xl': return 'w-24';
      default: return 'w-12';
    }
  };

  const statusClass = (): string => {
    if (!props.status) {return '';}
    return props.status === 'online' ? 'online' : 'offline';
  };

  const shapeClass = props.rounded !== false ? 'rounded-full' : 'rounded';

  return (
    <div
      class={`avatar ${statusClass()} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <div class={`${sizeClass()} ${shapeClass}`}>
        <Show
          when={props.src}
          fallback={
            <div class="bg-neutral text-neutral-content flex items-center justify-center w-full h-full">
              <span class="text-lg">{props.fallback ?? '?'}</span>
            </div>
          }
        >
          <img src={props.src} alt={props.alt ?? 'Avatar'} />
        </Show>
      </div>
    </div>
  );
}

export interface AvatarGroupProps {
  /** Avatar elements */
  readonly children: JSX.Element;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * AvatarGroup for stacking multiple avatars.
 * @param props
 */
export function AvatarGroup(props: AvatarGroupProps): JSX.Element {
  return (
    <div
      class={`avatar-group -space-x-4 ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      {props.children}
    </div>
  );
}
