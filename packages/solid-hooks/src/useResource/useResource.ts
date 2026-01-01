// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createEffect, createMemo, createSignal, untrack, type Accessor } from 'solid-js';
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

  // Use a memo to ensure we track changes to the value (works for both accessors and static values)
  const resolvedValue = createMemo(() => 
    typeof value === 'function' ? (value as Accessor<any>)() : value
  );
  
  const [resource, setResource] = createSignal<T | undefined>(getInitialResource(medplum, resolvedValue()));

  createEffect(() => {
    // Access the memoized value to create dependency tracking
    const val = resolvedValue();
    
    // Match React's logic: get initial resource first
    const newValue = getInitialResource(medplum, val);
    
    // Only fetch if there's no initial value AND it's a Reference
    if (!newValue && isReference(val)) {
      medplum
        .readReference(val as Reference<T>)
        .then((r) => setResourceIfChanged(r as T))
        .catch((err) => {
          setResource(undefined);  // Clear resource on error
          handleError(err);
        });
    } else {
      // Use the initial value directly (partial resources, cached resources, etc.)
      setResourceIfChanged(newValue as T);
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
