// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';
import { Show } from 'solid-js';

export interface CardProps extends ParentProps {
  /** Card title */
  readonly title?: string;
  /** Subtitle or description */
  readonly subtitle?: string;
  /** Card image URL */
  readonly image?: string;
  /** Image alt text */
  readonly imageAlt?: string;
  /** Whether image is at top (vs side) */
  readonly imagePosition?: 'top' | 'side';
  /** Whether card is bordered */
  readonly bordered?: boolean;
  /** Whether card has shadow */
  readonly shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Card component using DaisyUI styling.
 * @param props
 */
export function Card(props: CardProps): JSX.Element {
  const shadowClass = (): string => {
    switch (props.shadow) {
      case 'none': return '';
      case 'sm': return 'shadow-sm';
      case 'lg': return 'shadow-lg';
      default: return 'shadow-md';
    }
  };

  const imageClass = props.imagePosition === 'side' ? 'card-side' : '';
  const borderClass = props.bordered ? 'border border-base-300' : '';

  return (
    <div
      class={`card bg-base-100 ${imageClass} ${shadowClass()} ${borderClass} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <Show when={props.image}>
        <figure>
          <img src={props.image} alt={props.imageAlt ?? 'Card image'} />
        </figure>
      </Show>
      <div class="card-body">
        <Show when={props.title}>
          <h2 class="card-title">{props.title}</h2>
        </Show>
        <Show when={props.subtitle}>
          <p class="text-sm text-base-content/70">{props.subtitle}</p>
        </Show>
        {props.children}
      </div>
    </div>
  );
}

export interface CardActionsProps extends ParentProps {
  /** Actions alignment */
  readonly justify?: 'start' | 'center' | 'end';
  /** Additional CSS class */
  readonly class?: string;
}

/**
 * CardActions for buttons/links at bottom of card.
 * @param props
 */
export function CardActions(props: CardActionsProps): JSX.Element {
  const justifyClass = (): string => {
    switch (props.justify) {
      case 'start': return 'justify-start';
      case 'center': return 'justify-center';
      default: return 'justify-end';
    }
  };

  return (
    <div class={`card-actions ${justifyClass()} ${props.class ?? ''}`}>
      {props.children}
    </div>
  );
}
