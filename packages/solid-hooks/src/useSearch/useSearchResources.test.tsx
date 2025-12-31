// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { operationOutcomeToString, sleep } from '@medplum/core';
import type { Patient } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { MemoryRouter } from '@solidjs/router';
import { describe, test, expect, beforeAll, vi } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useSearchResources } from './useSearch';

function TestComponent(props: { name: string }): JSX.Element {
  return (
    <div>
      {(() => {
        const [resources, loading, outcome] = useSearchResources('Patient', { name: props.name });
        return (
          <>
            <div data-testid="resources">{JSON.stringify(resources())}</div>
            <div data-testid="loading">{loading().toString()}</div>
            <div data-testid="outcome">{outcome() && operationOutcomeToString(outcome()!)}</div>
          </>
        );
      })()}
    </div>
  );
}

describe('useSearch hooks', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  test('Happy path', async () => {
    const medplum = new MockClient();
    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <TestComponent name="homer" />
        </MedplumProvider>
      </MemoryRouter>
    ));

    await waitFor(() => expect(screen.getByTestId('outcome')).toHaveTextContent('All OK'));
    const resources = JSON.parse(screen.getByTestId('resources').textContent || '[]') as Patient[];
    expect(Array.isArray(resources)).toBe(true);
    expect(resources).toHaveLength(1);
  });

  test('Debounced search', async () => {
    const medplum = new MockClient();
    const medplumSearchResources = vi.spyOn(medplum, 'searchResources');
    const [name, setName] = createSignal('bart');

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent name={name()} />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    const initialResources = JSON.parse(screen.getByTestId('resources').textContent || '[]') as Patient[];
    expect(initialResources).toHaveLength(1);
    expect(initialResources?.[0]?.resourceType).toEqual('Patient');
    expect(initialResources?.[0]?.name).toEqual([{ given: ['Bart'], family: 'Simpson' }]);
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
    expect(medplumSearchResources).toHaveBeenCalledTimes(1);

    setName('marge');
    await waitFor(() => expect(medplumSearchResources).toHaveBeenCalledTimes(2));

    setName('home');
    expect(medplumSearchResources).toHaveBeenCalledTimes(2);

    setName('homer');
    expect(medplumSearchResources).toHaveBeenCalledTimes(2);

    // Wait for debounce (150ms + buffer)
    await sleep(300);
    expect(medplumSearchResources).toHaveBeenCalledTimes(3);
    expect(medplumSearchResources).toHaveBeenLastCalledWith('Patient', { name: 'homer' });
    await waitFor(() => {
      const finalResources = JSON.parse(screen.getByTestId('resources').textContent || '[]') as Patient[];
      expect(finalResources).toHaveLength(1);
      expect(finalResources?.[0]?.resourceType).toEqual('Patient');
      expect(finalResources?.[0]?.name).toEqual([{ given: ['Homer'], family: 'Simpson' }]);
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
  });
});