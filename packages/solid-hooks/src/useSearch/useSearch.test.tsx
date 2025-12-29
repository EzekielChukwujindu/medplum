// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { allOk, operationOutcomeToString, sleep } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { MemoryRouter } from '@solidjs/router';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useSearch } from './useSearch';

function TestComponent(props: { name: string }): JSX.Element {
  return (
    <div>
      {(() => {
        const [bundle, loading, outcome] = useSearch('Patient', { name: props.name });
        return (
          <>
            <div data-testid="bundle">{JSON.stringify(bundle)}</div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="outcome">{outcome && operationOutcomeToString(outcome)}</div>
          </>
        );
      })()}
    </div>
  );
}

describe('useSearch hooks', () => {
  beforeAll(() => {
    console.error = jest.fn();
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
    const bundle = JSON.parse(screen.getByTestId('bundle').textContent || '{}');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry).toHaveLength(1);
  });

  test('Debounced search', async () => {
    const medplum = new MockClient();
    const medplumSearch = jest.spyOn(medplum, 'search');
    const [name, setName] = createSignal('bart');

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent name={name()} />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    const initialBundle = JSON.parse(screen.getByTestId('bundle').textContent || '{}');
    expect(initialBundle?.resourceType).toEqual('Bundle');
    expect(initialBundle?.entry).toHaveLength(1);
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
    expect(medplumSearch).toHaveBeenCalledTimes(1);

    setName('marge');
    await waitFor(() => expect(medplumSearch).toHaveBeenCalledTimes(2));

    setName('home');
    expect(medplumSearch).toHaveBeenCalledTimes(2);

    setName('homer');
    expect(medplumSearch).toHaveBeenCalledTimes(2);

    // Wait for debounce (150ms + buffer)
    await sleep(300);
    expect(medplumSearch).toHaveBeenCalledTimes(3);
    expect(medplumSearch).toHaveBeenLastCalledWith('Patient', { name: 'homer' });
    await waitFor(() => {
      const finalBundle = JSON.parse(screen.getByTestId('bundle').textContent || '{}');
      expect(finalBundle?.resourceType).toEqual('Bundle');
      expect(finalBundle?.entry).toHaveLength(1);
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
  });
});