// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createEffect, createSignal, onCleanup } from 'solid-js';
import type { MedplumClient } from '@medplum/core';
import { deepEquals, isReference, isResource, normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome, Reference, Resource } from '@medplum/fhirtypes';
import { useMedplum } from '../MedplumProvider/MedplumProvider.context';

/**
 * Solid Hook to use a FHIR reference.
 * Handles the complexity of resolving references and caching resources.
 * @param value - The resource or reference to resource.
 * @param setOutcome - Optional callback to set the OperationOutcome.
 * @returns The resolved resource.
 */
export function useResource<T extends Resource>(
  value: Reference<T> | Partial<T> | undefined,
  setOutcome?: (outcome: OperationOutcome) => void
): T | undefined {
  const medplum = useMedplum();

  // We use deepEquals to ensure the signal only notifies when the resource actually changes,
  // replicating React's setResourceIfChanged logic.
  const [resource, setResource] = createSignal<T | undefined>(
    getInitialResource(medplum, value),
    { equals: deepEquals }
  );

  createEffect(() => {
    // By accessing value and medplum here, Solid tracks them.
    // If they are reactive (e.g., props), the effect will re-run on change.
    const currentMedplum = medplum;
    const currentValue = value;
    let subscribed = true;

    const newValue = getInitialResource(currentMedplum, currentValue);

    if (!newValue && isReference(currentValue)) {
      currentMedplum
        .readReference(currentValue as Reference<T>)
        .then((r) => {
          if (subscribed) {
            setResource(() => r);
          }
        })
        .catch((err) => {
          if (subscribed) {
            setResource(undefined);
            if (setOutcome) {
              setOutcome(normalizeOperationOutcome(err));
            }
          }
        });
    } else {
      setResource(() => newValue);
    }

    onCleanup(() => {
      subscribed = false;
    });
  });

  return resource();
}

/**
 * Returns the initial resource value based on the input value.
 */
function getInitialResource<T extends Resource>(
  medplum: MedplumClient,
  value: Reference<T> | Partial<T> | undefined
): T | undefined {
  if (value) {
    if (isResource(value)) {
      return value as T;
    }

    if (isReference(value)) {
      return medplum.getCachedReference(value as Reference<T>);
    }
  }
  return undefined;
}