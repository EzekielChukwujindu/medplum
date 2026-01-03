// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QueryTypes, ResourceArray } from '@medplum/core';
import { allOk, normalizeOperationOutcome } from '@medplum/core';
import type { Bundle, ExtractResource, OperationOutcome, ResourceType } from '@medplum/fhirtypes';
import { createMemo, type Accessor } from 'solid-js';
import { useQuery } from '@tanstack/solid-query';
import { useMedplum } from '../MedplumProvider/MedplumProvider.context';
import { useDebouncedValue } from '../useDebouncedValue/useDebouncedValue';

type SearchFn = 'search' | 'searchOne' | 'searchResources';
export type SearchOptions = { debounceMs?: number };

const DEFAULT_DEBOUNCE_MS = 250;

export function useSearch<K extends ResourceType>(
  resourceType: K | Accessor<K>,
  query?: QueryTypes | Accessor<QueryTypes | undefined>,
  options?: SearchOptions
): [Accessor<Bundle<ExtractResource<K>> | undefined>, Accessor<boolean>, Accessor<OperationOutcome | undefined>] {
  return useSearchImpl<K, Bundle<ExtractResource<K>>>('search', resourceType, query, options);
}

export function useSearchOne<K extends ResourceType>(
  resourceType: K | Accessor<K>,
  query?: QueryTypes | Accessor<QueryTypes | undefined>,
  options?: SearchOptions
): [Accessor<ExtractResource<K> | undefined>, Accessor<boolean>, Accessor<OperationOutcome | undefined>] {
  return useSearchImpl<K, ExtractResource<K>>('searchOne', resourceType, query, options);
}

export function useSearchResources<K extends ResourceType>(
  resourceType: K | Accessor<K>,
  query?: QueryTypes | Accessor<QueryTypes | undefined>,
  options?: SearchOptions
): [Accessor<ResourceArray<ExtractResource<K>> | undefined>, Accessor<boolean>, Accessor<OperationOutcome | undefined>] {
  return useSearchImpl<K, ResourceArray<ExtractResource<K>>>('searchResources', resourceType, query, options);
}

function useSearchImpl<K extends ResourceType, SearchReturnType>(
  searchFn: SearchFn,
  resourceType: K | Accessor<K>,
  query: QueryTypes | Accessor<QueryTypes | undefined> | undefined,
  options?: SearchOptions
): [Accessor<SearchReturnType | undefined>, Accessor<boolean>, Accessor<OperationOutcome | undefined>] {
  const medplum = useMedplum();

  // Helpers to resolve accessors
  const getResourceType = () => (typeof resourceType === 'function' ? (resourceType as Accessor<K>)() : resourceType);
  const getQuery = () => (typeof query === 'function' ? (query as Accessor<QueryTypes | undefined>)() : query);

  // We debounce the *inputs* to the query key, rather than the query itself
  // Only debounce if options.debounceMs > 0
  const debounceMs = options?.debounceMs ?? DEFAULT_DEBOUNCE_MS;

  // Create a memo for the inputs so we can debounce them together
  const searchInputs = createMemo(() => ({
    type: getResourceType(),
    query: getQuery(),
  }));

  // Debounce the entire input object
  const [debouncedInputs] = useDebouncedValue(searchInputs, debounceMs);

  const queryResult = useQuery(() => ({
    queryKey: ['useSearch', searchFn, debouncedInputs().type, debouncedInputs().query],
    queryFn: async () => {
      const inputs = debouncedInputs();
      return medplum[searchFn](inputs.type, inputs.query) as unknown as Promise<SearchReturnType>;
    },
    // Keep previous data while fetching new data to prevent flickering
    // queryFn: async () => {
    //   const inputs = debouncedInputs();
    //   return medplum[searchFn](inputs.type, inputs.query) as unknown as Promise<SearchReturnType>;
    // },
    retry: false,
    // staleTime: 0 (default) ensures we always check for new data on mount/invalidate, 
    // but relies on cache for immediate display if available.
    // We removed the 5 minute staleTime to prevent users seeing old data.
  }));

  const data = () => queryResult.data;
  const loading = () => queryResult.isLoading || queryResult.isFetching;
  const error = () => {
    if (queryResult.error) {
      return normalizeOperationOutcome(queryResult.error);
    }
    // If we have data and no error, return allOk to match previous behavior
    if (queryResult.data) {
      return allOk;
    }
    return undefined;
  };

  return [data, loading, error];
}