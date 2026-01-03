// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { InternalSchemaElement, TypedValue } from '@medplum/core';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';

export interface ResourceDiffRowProps {
  readonly name: string;
  readonly path: string;
  readonly property: InternalSchemaElement | undefined;
  readonly originalValue: TypedValue | undefined;
  readonly revisedValue: TypedValue | undefined;
}

/**
 * ResourceDiffRow displays a single row in a resource diff table,
 * showing before and after values for a property change.
 * @param props
 */
export function ResourceDiffRow(props: ResourceDiffRowProps): JSX.Element {
  const isAttachmentType = () => !!props.property?.type?.find((t) => t.code === 'Attachment');
  const [isCollapsed, setIsCollapsed] = createSignal<boolean>(isAttachmentType());
  const toggleCollapse = (): void => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <>
      <Show
        when={!isAttachmentType() || !isCollapsed()}
        fallback={
          <tr>
            <td class="font-medium">{props.name}</td>
            <td colSpan={2} class="text-right">
              <button
                type="button"
                class="btn btn-sm btn-ghost"
                onClick={toggleCollapse}
              >
                Expand
              </button>
            </td>
          </tr>
        }
      >
        <tr>
          <td class="font-medium">{props.name}</td>
          <td class="bg-error/10">
            <Show when={props.originalValue}>
              <ResourcePropertyDisplay
                path={props.path}
                property={props.property}
                propertyType={props.originalValue!.type}
                value={props.originalValue!.value}
                ignoreMissingValues={true}
              />
            </Show>
          </td>
          <td class="bg-success/10">
            <Show when={props.revisedValue}>
              <ResourcePropertyDisplay
                path={props.path}
                property={props.property}
                propertyType={props.revisedValue!.type}
                value={props.revisedValue!.value}
                ignoreMissingValues={true}
              />
            </Show>
          </td>
        </tr>
      </Show>
    </>
  );
}
