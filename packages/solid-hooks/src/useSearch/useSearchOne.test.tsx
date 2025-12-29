// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { allOk, operationOutcomeToString, sleep } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { MemoryRouter } from '@solidjs/router'; // Assuming Solid router equivalent
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useSearchOne } from './useSearch';

function TestComponent(props: { name: string }): JSX.Element {
  return (
    <div>
      {(() => {
        const [patient, loading, outcome] = useSearchOne('Patient', { name: props.name });
        return (
          <>
            <div data-testid="patient">{JSON.stringify(patient)}</div>
            <div data-testid="loading">{loading.toString()}</div>
            <div data-testid="outcome">{outcome && operationOutcomeToString(outcome)}</div>
          </>
        );
      })()}
    </div>
  );
}

describe('useSearchOne hook', () => {
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
    const patient = JSON.parse(screen.getByTestId('patient').textContent || '{}');
    expect(patient?.resourceType).toBe('Patient');
  });

  test('Debounced search', async () => {
    const medplum = new MockClient();
    const medplumSearchOne = jest.spyOn(medplum, 'searchOne');
    const [name, setName] = createSignal('bart');

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent name={name()} />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
    const initialPatient = JSON.parse(screen.getByTestId('patient').textContent || '{}');
    expect(initialPatient?.resourceType).toEqual('Patient');
    expect(initialPatient?.name).toEqual([{ given: ['Bart'], family: 'Simpson' }]);
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
    expect(medplumSearchOne).toHaveBeenCalledTimes(1);

    setName('marge');
    await waitFor(() => expect(medplumSearchOne).toHaveBeenCalledTimes(2));

    setName('home');
    expect(medplumSearchOne).toHaveBeenCalledTimes(2);

    setName('homer');
    expect(medplumSearchOne).toHaveBeenCalledTimes(2);

    // Wait for debounce (150ms + buffer)
    await sleep(300);
    expect(medplumSearchOne).toHaveBeenCalledTimes(3);
    expect(medplumSearchOne).toHaveBeenLastCalledWith('Patient', { name: 'homer' });
    await waitFor(() => {
      const finalPatient = JSON.parse(screen.getByTestId('patient').textContent || '{}');
      expect(finalPatient?.resourceType).toEqual('Patient');
      expect(finalPatient?.name).toEqual([{ given: ['Homer'], family: 'Simpson' }]);
    });
    expect(screen.getByTestId('loading')).toHaveTextContent('false');
    expect(screen.getByTestId('outcome')).toHaveTextContent('All OK');
  });
});