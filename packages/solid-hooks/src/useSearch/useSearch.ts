// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QueryTypes, ResourceArray } from '@medplum/core';
import { allOk, normalizeOperationOutcome } from '@medplum/core';
import type { Bundle, ExtractResource, OperationOutcome, ResourceType } from '@medplum/fhirtypes';
import { createEffect, createSignal, on, createMemo } from 'solid-js';
import { useMedplum } from '../MedplumProvider/MedplumProvider.context';
import { useDebouncedValue } from '../useDebouncedValue/useDebouncedValue'; // Assume from solid-primitives if customized

type SearchFn = 'search' | 'searchOne' | 'searchResources';
export type SearchOptions = { debounceMs?: number };

const DEFAULT_DEBOUNCE_MS = 250;

export function useSearch<K extends ResourceType>(
  resourceType: K,
  query?: QueryTypes,
  options?: SearchOptions
): [Bundle<ExtractResource<K>> | undefined, boolean, OperationOutcome | undefined] {
  return useSearchImpl<K, Bundle<ExtractResource<K>>>('search', resourceType, query, options);
}

export function useSearchOne<K extends ResourceType>(
  resourceType: K,
  query?: QueryTypes,
  options?: SearchOptions
): [ExtractResource<K> | undefined, boolean, OperationOutcome | undefined] {
  return useSearchImpl<K, ExtractResource<K>>('searchOne', resourceType, query, options);
}

export function useSearchResources<K extends ResourceType>(
  resourceType: K,
  query?: QueryTypes,
  options?: SearchOptions
): [ResourceArray<ExtractResource<K>> | undefined, boolean, OperationOutcome | undefined] {
  return useSearchImpl<K, ResourceArray<ExtractResource<K>>>('searchResources', resourceType, query, options);
}

function useSearchImpl<K extends ResourceType, SearchReturnType>(
  searchFn: SearchFn,
  resourceType: K,
  query: QueryTypes | undefined,
  options?: SearchOptions
): [SearchReturnType | undefined, boolean, OperationOutcome | undefined] {
  const medplum = useMedplum();
  const [lastSearchKey, setLastSearchKey] = createSignal<string>();
  const [loading, setLoading] = createSignal<boolean>(true);
  const [result, setResult] = createSignal<SearchReturnType>();
  const [outcome, setOutcome] = createSignal<OperationOutcome>();

  const searchKey = createMemo(() => medplum.fhirSearchUrl(resourceType, query).toString());
  const debouncedSearchKey = useDebouncedValue(searchKey, options?.debounceMs ?? DEFAULT_DEBOUNCE_MS, {
    leading: true,
  });

  createEffect(
    on(debouncedSearchKey, (key) => {
      if (key !== lastSearchKey()) {
        setLastSearchKey(key);
        setLoading(true);
        medplum[searchFn](resourceType, query)
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
    })
  );

  return [result(), loading(), outcome()];
}