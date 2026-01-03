// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Link href (optional - last item typically has no href) */
  href?: string;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items */
  readonly items: BreadcrumbItem[];
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Breadcrumbs component using DaisyUI styling.
 * Shows navigation path with clickable links.
 * @param props
 */
export function Breadcrumbs(props: BreadcrumbsProps): JSX.Element {
  return (
    <div class={`breadcrumbs text-sm ${props.class ?? ''}`} data-testid={props.testId}>
      <ul>
        <For each={props.items}>
          {(item, index) => (
            <li>
              {item.href ? (
                <MedplumLink to={item.href}>{item.label}</MedplumLink>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
