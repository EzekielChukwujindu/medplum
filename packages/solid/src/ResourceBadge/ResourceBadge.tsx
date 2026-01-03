// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Reference, Resource } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { ResourceAvatar } from '../ResourceAvatar/ResourceAvatar';
import { ResourceName } from '../ResourceName/ResourceName';

export interface ResourceBadgeProps {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
}

/**
 * ResourceBadge displays an avatar and name together for a resource.
 * @param props
 */
export function ResourceBadge(props: ResourceBadgeProps): JSX.Element {
  return (
    <div class="flex items-center gap-2">
      <ResourceAvatar size={24} value={props.value} link={props.link} />
      <ResourceName value={props.value} link={props.link} />
    </div>
  );
}
