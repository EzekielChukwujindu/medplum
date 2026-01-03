// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createMemo, type Accessor } from 'solid-js';
import { isReference, isResource, normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome, Reference, Resource } from '@medplum/fhirtypes';
import { useQuery } from '@tanstack/solid-query';
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

  // Normalize value to an accessor
  const valueAccessor = createMemo(() => {
    return typeof value === 'function' ? (value as Accessor<Reference<T> | Partial<T> | undefined>)() : value;
  });

  /*
   * We use useQuery to handle data fetching and caching.
   * To maintain parity with the previous implementation (and React), we attempt to provide 'initialData'
   * if the valid is already a resource or is a cached reference. This ensures synchronous rendering where possible.
   */
  const query = useQuery(() => {
    const val = valueAccessor();
    return {
      queryKey: ['useResource', val],
      queryFn: async () => {
        if (!val) {
          return null;
        }
        if (isResource(val)) {
          return val as T;
        }
        if (isReference(val)) {
          // readReference can return undefined? Unlikely for promise, but we should handle 404s via catch usually.
          return medplum.readReference(val as Reference<T>);
        }
        return null; // Return null instead of undefined to satisfy TanStack Query
      },
      // initialData allows us to show data immediately if we have it (Resource passed in, or Reference in cache)
      initialData: () => {
        if (!val) {
          return undefined; // No data
        }
        if (isResource(val)) {
          return val as T;
        }
        if (isReference(val)) {
          return medplum.getCachedReference(val as Reference<T>) as T | undefined;
        }
        return undefined;
      },
      // Stale time: 0 (default) ensures we consider data stale immediately, allowing refetching in background
      // while showing initialData if available. This ensures we don't show outdated server data for long.
    };
  });

  // Handle errors
  createMemo(() => {
    if (query.error && setOutcome) {
      setOutcome(normalizeOperationOutcome(query.error));
    }
  });

  // Return the data accessor.
  // We check for null (our "no data" value) and return undefined to the consumer to match signature.
  return () => {
    const d = query.data;
    return d === null ? undefined : d;
  };
}
