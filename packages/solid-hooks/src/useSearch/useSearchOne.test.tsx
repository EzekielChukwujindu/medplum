// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { operationOutcomeToString } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { describe, test, expect, beforeAll, vi } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useSearchOne } from './useSearch';

function TestComponent(props: { name: string }): JSX.Element {
  return (
    <div>
      {(() => {
        const [patient, loading, outcome] = useSearchOne('Patient', { name: props.name });
        return (
          <>
            <div data-testid="patient">{JSON.stringify(patient())}</div>
            <div data-testid="loading">{loading().toString()}</div>
            <div data-testid="outcome">{outcome() && operationOutcomeToString(outcome()!)}</div>
          </>
        );
      })()}
    </div>
  );
}

describe('useSearchOne hook', () => {
  beforeAll(() => {
    console.error = vi.fn();
  });

  test('Happy path', async () => {
    const medplum = new MockClient();
    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent name="homer" />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('outcome')).toHaveTextContent('All OK'));
    const patient = JSON.parse(screen.getByTestId('patient').textContent || '{}');
    expect(patient?.resourceType).toBe('Patient');
  });



  test('Debounced search', async () => {
    const medplum = new MockClient();
    const medplumSearchOne = vi.spyOn(medplum, 'searchOne');
    const [name, setName] = createSignal('bart');
    
    function TestWrapper(props: { name: string }) {
      useSearchOne('Patient', () => ({ name: props.name }), { debounceMs: 150 });
      return <div></div>;
    }

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestWrapper name={name()} />
      </MedplumProvider>
    ));

    // 1. Initial render ('bart')
    await waitFor(() => expect(medplumSearchOne).toHaveBeenCalledTimes(1));
    expect(medplumSearchOne).toHaveBeenLastCalledWith('Patient', { name: 'bart' });

    // 2. Update to 'marge'
    setName('marge');
    await waitFor(() => expect(medplumSearchOne).toHaveBeenCalledTimes(2));
    expect(medplumSearchOne).toHaveBeenLastCalledWith('Patient', { name: 'marge' });

    // 3. Update to 'home' (debounce)
    setName('home');
    await new Promise(r => setTimeout(r, 50));
    expect(medplumSearchOne).toHaveBeenCalledTimes(2);

    // 4. Update to 'homer' (debounce)
    setName('homer');
    await new Promise(r => setTimeout(r, 50));
    expect(medplumSearchOne).toHaveBeenCalledTimes(2);

    // 5. Wait for debounce
    await new Promise(r => setTimeout(r, 300));
    expect(medplumSearchOne).toHaveBeenLastCalledWith('Patient', { name: 'homer' });
    expect(medplumSearchOne).toHaveBeenCalledTimes(3); 
  });
});