// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { SearchResults } from './SearchResults';
import type { Bundle } from '@medplum/fhirtypes';

describe('SearchResults', () => {
  const mockBundle: Bundle = {
    resourceType: 'Bundle',
    type: 'searchset',
    total: 2,
    entry: [
      { resource: { resourceType: 'Patient', id: 'p1', meta: { lastUpdated: '2024-01-01T00:00:00Z' } } },
      { resource: { resourceType: 'Patient', id: 'p2', meta: { lastUpdated: '2024-01-02T00:00:00Z' } } },
    ],
  };

  test('Shows loading state', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchResults resourceType="Patient" loading testId="results" />
      </MedplumProvider>
    ));
    const container = screen.getByTestId('results');
    const loading = container.querySelector('.loading');
    expect(loading).toBeTruthy();
  });

  test('Shows empty state', () => {
    const client = createMockMedplumClient();
    const emptyBundle: Bundle = { resourceType: 'Bundle', type: 'searchset', entry: [] };
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchResults resourceType="Patient" bundle={emptyBundle} testId="results" />
      </MedplumProvider>
    ));
    expect(screen.getByText('No results found')).toBeTruthy();
  });

  test('Renders results table', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchResults resourceType="Patient" bundle={mockBundle} testId="results" />
      </MedplumProvider>
    ));
    expect(screen.getByText('p1')).toBeTruthy();
    expect(screen.getByText('p2')).toBeTruthy();
  });

  test('Calls onRowClick', () => {
    const client = createMockMedplumClient();
    const handleClick = vi.fn();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchResults
          resourceType="Patient"
          bundle={mockBundle}
          onRowClick={handleClick}
          testId="results"
        />
      </MedplumProvider>
    ));
    fireEvent.click(screen.getByText('p1'));
    expect(handleClick).toHaveBeenCalled();
  });

  test('Shows total count', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <SearchResults resourceType="Patient" bundle={mockBundle} testId="results" />
      </MedplumProvider>
    ));
    expect(screen.getByText('2 results')).toBeTruthy();
  });
});
