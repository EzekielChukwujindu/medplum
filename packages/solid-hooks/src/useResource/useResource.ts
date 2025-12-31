// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createEffect, createSignal, untrack, type Accessor } from 'solid-js';
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
  value: Reference<T> | Partial<T> | undefined | Accessor<Reference<T> | Partial<T> | undefined>,
  setOutcome?: (outcome: OperationOutcome) => void
): Accessor<T | undefined> {
  const medplum = useMedplum();

  const getValue = () => (typeof value === 'function' ? (value as Accessor<any>)() : value);
  const [resource, setResource] = createSignal<T | undefined>(getInitialResource(medplum, getValue()));

  createEffect(() => {
    const currentValue = getValue();
    if (currentValue) {
      const reference =
        typeof currentValue === 'object' && 'reference' in currentValue ? (currentValue.reference as string) : undefined;
      const resourceType =
        typeof currentValue === 'object' && 'resourceType' in currentValue ? (currentValue.resourceType as string) : undefined;
      const id = typeof currentValue === 'object' && 'id' in currentValue ? (currentValue.id as string) : undefined;

      if (resourceType && id) {
        medplum
          .readResource(resourceType as any, id)
          .then((r) => setResourceIfChanged(r as T))
          .catch(handleError);
      } else if (reference) {
        medplum
          .readReference(currentValue as Reference<T>)
          .then((r) => setResourceIfChanged(r as T))
          .catch(handleError);
      } else if (resourceType) {
        setResourceIfChanged(currentValue as T);
      }
    } else {
      setResource(undefined);
    }
  });

  function setResourceIfChanged(r: T): void {
    if (!deepEquals(r, untrack(resource))) {
      setResource(() => r);
    }
  }

  function handleError(err: any): void {
    if (setOutcome) {
      setOutcome(normalizeOperationOutcome(err));
    }
  }

  return resource;
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
