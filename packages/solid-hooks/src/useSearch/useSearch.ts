// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QueryTypes, ResourceArray } from '@medplum/core';
import { allOk, normalizeOperationOutcome } from '@medplum/core';
import type { Bundle, ExtractResource, OperationOutcome, ResourceType } from '@medplum/fhirtypes';
import { createEffect, createSignal, createMemo, type Accessor } from 'solid-js';
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
  const [lastSearchKey, setLastSearchKey] = createSignal<string>();
  const [loading, setLoading] = createSignal<boolean>(true);
  const [result, setResult] = createSignal<SearchReturnType>();
  const [outcome, setOutcome] = createSignal<OperationOutcome>();

  // Helpers to resolve accessors
  const getResourceType = () => (typeof resourceType === 'function' ? (resourceType as Accessor<K>)() : resourceType);
  const getQuery = () => (typeof query === 'function' ? (query as Accessor<QueryTypes | undefined>)() : query);

  const searchKey = createMemo(() => medplum.fhirSearchUrl(getResourceType(), getQuery()).toString());
  
  // debouncedSearchKey is now an Accessor<string>
  const [debouncedSearchKey] = useDebouncedValue(searchKey, options?.debounceMs ?? DEFAULT_DEBOUNCE_MS, {
    leading: true,
  });

  createEffect(() => {
    // Track the debounced key
    const key = debouncedSearchKey();
    if (key !== lastSearchKey()) {
      setLastSearchKey(key);
      setLoading(true);
      medplum[searchFn](getResourceType(), getQuery())
        .then((res) => {
          setResult(() => res as SearchReturnType);
          setOutcome(allOk);
          setLoading(false);
        })
        .catch((err) => {
          setResult(undefined);
          setOutcome(normalizeOperationOutcome(err));
          setLoading(false);
        });
    }
  });

  return [result, loading, outcome];
}