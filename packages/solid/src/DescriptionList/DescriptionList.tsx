// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface DescriptionListProps extends ParentProps {
  /** Compact mode with less spacing */
  readonly compact?: boolean;
}

/**
 * DescriptionList renders a semantic dl element for key-value pairs.
 * @param props
 */
export function DescriptionList(props: DescriptionListProps): JSX.Element {
  const baseClass = 'grid gap-2';
  const compactClass = props.compact ? 'gap-1 text-sm' : 'gap-4';

  return (
    <dl class={`${baseClass} ${compactClass}`} data-testid="description-list">
      {props.children}
    </dl>
  );
}

export interface DescriptionListEntryProps extends ParentProps {
  /** The term/label for this entry */
  readonly term: string;
}

/**
 * DescriptionListEntry renders a dt/dd pair within a DescriptionList.
 * @param props
 */
export function DescriptionListEntry(props: DescriptionListEntryProps): JSX.Element {
  return (
    <div class="grid grid-cols-[auto_1fr] gap-x-4" data-testid="description-list-entry">
      <dt class="font-semibold text-base-content/70">{props.term}</dt>
      <dd class="text-base-content">{props.children}</dd>
    </div>
  );
}
