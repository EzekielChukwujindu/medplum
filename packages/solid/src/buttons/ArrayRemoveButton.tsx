// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { CircleMinus } from 'lucide-solid';
import type { JSX } from 'solid-js';

export interface ArrayRemoveButtonProps {
  readonly propertyDisplayName?: string;
  readonly onClick: (e: MouseEvent) => void;
  readonly testId?: string;
}

export function ArrayRemoveButton(props: ArrayRemoveButtonProps): JSX.Element {
  return (
    <button
        class="btn btn-sm btn-ghost text-error"
        title={props.propertyDisplayName ? `Remove ${props.propertyDisplayName}` : 'Remove'}
        data-testid={props.testId}
        onClick={props.onClick}
    >
      <CircleMinus class="h-5 w-5" />
    </button>
  );
}
