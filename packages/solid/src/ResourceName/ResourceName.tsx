// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { getDisplayString, isOk, normalizeErrorString } from '@medplum/core';
import type { OperationOutcome, Reference, Resource } from '@medplum/fhirtypes';
import { useResource } from '@medplum/solid-hooks';
import { createSignal  } from 'solid-js';
import type {JSX} from 'solid-js';
import { MedplumLink } from '../MedplumLink/MedplumLink';

export interface ResourceNameProps {
  readonly value?: Reference | Resource;
  readonly link?: boolean;
  readonly class?: string;
}

/**
 * ResourceName displays the name of a resource.
 * If the value is a Reference, it fetches the resource first.
 * @param props
 */
export function ResourceName(props: ResourceNameProps): JSX.Element | null {
  const [outcome, setOutcome] = createSignal<OperationOutcome | undefined>();
  const resource = useResource(props.value, setOutcome);
  
  const text = (): string | null => {
    const currentOutcome = outcome();
    if (currentOutcome && !isOk(currentOutcome)) {
      return `[${normalizeErrorString(currentOutcome)}]`;
    }
    const res = resource();
    if (res) {
      return getDisplayString(res);
    }
    return null;
  };

  const textValue = text();
  if (!textValue) {
    return null;
  }

  return props.link ? (
    <MedplumLink to={props.value} class={props.class}>
      {textValue}
    </MedplumLink>
  ) : (
    <span class={props.class}>{textValue}</span>
  );
}
