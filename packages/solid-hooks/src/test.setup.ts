// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { indexSearchParameterBundle, indexStructureDefinitionBundle } from '@medplum/core';
import { SEARCH_PARAMETER_BUNDLE_FILES, readJson } from '@medplum/definitions';
import type { Bundle, SearchParameter } from '@medplum/fhirtypes';
import { TextDecoder, TextEncoder } from 'node:util';
import '@testing-library/jest-dom'; // Still compatible with Solid Testing Library

// 1. Ensure Global Polyfills for Node environment
Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder });
Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder });

// 2. SolidJS and some browser environments require broader mocking of ResizeObserver
// compared to basic Jest mocks.
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// 3. Medplum Indexing logic (Remains unchanged as it is framework-agnostic)
indexStructureDefinitionBundle(readJson('fhir/r4/profiles-types.json') as Bundle);
indexStructureDefinitionBundle(readJson('fhir/r4/profiles-resources.json') as Bundle);
indexStructureDefinitionBundle(readJson('fhir/r4/profiles-medplum.json') as Bundle);

for (const filename of SEARCH_PARAMETER_BUNDLE_FILES) {
  indexSearchParameterBundle(readJson(filename) as Bundle<SearchParameter>);
}

// 4. Recommendation: If using Vitest (common with SolidJS), 
// ensure you clear mocks between tests automatically.
// import { beforeEach, vi } from 'vitest';
// beforeEach(() => {
//   vi.clearAllMocks();
// });