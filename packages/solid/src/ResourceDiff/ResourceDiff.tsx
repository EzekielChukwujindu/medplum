// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { stringify } from '@medplum/core';
import type { Resource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import type { Delta } from '../utils/diff';
import { diff } from '../utils/diff';

export interface ResourceDiffProps {
  /** Original resource */
  readonly original: Resource;
  /** Revised resource */
  readonly revised: Resource;
  /** Ignore meta field in comparison */
  readonly ignoreMeta?: boolean;
}

/**
 * ResourceDiff displays a visual diff between two resource versions.
 * @param props
 */
export function ResourceDiff(props: ResourceDiffProps): JSX.Element {
  const getDeltas = (): Delta[] => {
    let originalResource = props.original;
    let revisedResource = props.revised;

    if (props.ignoreMeta) {
      originalResource = { ...originalResource, meta: undefined };
      revisedResource = { ...revisedResource, meta: undefined };
    }

    const original = stringify(originalResource, true).match(/[^\r\n]+/g) as string[];
    const revised = stringify(revisedResource, true).match(/[^\r\n]+/g) as string[];
    return diff(original, revised);
  };

  return (
    <pre class="text-base-content/60 text-sm">
      <For each={getDeltas()}>
        {(delta) => <ChangeDiff delta={delta} />}
      </For>
    </pre>
  );
}

interface ChangeDiffProps {
  readonly delta: Delta;
}

function ChangeDiff(props: ChangeDiffProps): JSX.Element {
  return (
    <>
      ...
      <br />
      <Show when={props.delta.original.lines.length > 0}>
        <div class="bg-error/20 text-error">
          {props.delta.original.lines.join('\n')}
        </div>
      </Show>
      <Show when={props.delta.revised.lines.length > 0}>
        <div class="bg-success/20 text-success">
          {props.delta.revised.lines.join('\n')}
        </div>
      </Show>
      ...
      <br />
    </>
  );
}
