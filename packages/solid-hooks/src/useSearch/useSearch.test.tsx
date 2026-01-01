// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { operationOutcomeToString } from '@medplum/core';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { describe, test, expect, beforeAll, vi } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useSearch } from './useSearch';

function TestComponent(props: { name: string }): JSX.Element {
  return (
    <div>
      {(() => {
        const [bundle, loading, outcome] = useSearch('Patient', { name: props.name });
        return (
          <>
            <div data-testid="bundle">{JSON.stringify(bundle())}</div>
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
      <MedplumProvider medplum={medplum}>
        <TestComponent name="homer" />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('outcome')).toHaveTextContent('All OK'));
    const bundle = JSON.parse(screen.getByTestId('bundle').textContent || '{}');
    expect(bundle.resourceType).toBe('Bundle');
    expect(bundle.entry).toHaveLength(1);
  });

  test('Debounced search', async () => {
    const medplum = new MockClient();
    const medplumSearch = vi.spyOn(medplum, 'search');
    
    // Use signals to drive the component updates since renderHook is different in Solid
    const [name, setName] = createSignal('bart');
    
    function TestWrapper(props: { name: string }) {
      // Use useSearch with debounceMs 150
      // Note: In Solid, we pass signal accessors directly or wrapped in function
      useSearch('Patient', () => ({ name: props.name }), { debounceMs: 150 });
      
      return (
        <div>
           {/* Add data-testid elements to wait for if needed, or just track medplumSearch */}
        </div>
      );
    }

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestWrapper name={name()} />
      </MedplumProvider>
    ));

    // 1. Initial render ('bart') - Should trigger immediate search (leading edge)
    await waitFor(() => expect(medplumSearch).toHaveBeenCalledTimes(1));
    expect(medplumSearch).toHaveBeenLastCalledWith('Patient', { name: 'bart' });

    // 2. Update to 'marge' - Should trigger immediate search (leading edge)
    setName('marge');
    await waitFor(() => expect(medplumSearch).toHaveBeenCalledTimes(2));
    expect(medplumSearch).toHaveBeenLastCalledWith('Patient', { name: 'marge' });

    // 3. Update to 'home' - Should NOT trigger search (cooldown/debounce)
    setName('home');
    // Wait a tiny bit (less than debounce) to ensure no call happened
    await new Promise(r => setTimeout(r, 50));
    expect(medplumSearch).toHaveBeenCalledTimes(2);

    // 4. Update to 'homer' - Should NOT trigger search (still debouncing previous?)
    setName('homer');
    await new Promise(r => setTimeout(r, 50));
    expect(medplumSearch).toHaveBeenCalledTimes(2);

    // 5. Wait for debounce to finish
    await new Promise(r => setTimeout(r, 300));
    
    // React expects 3. SolidJS is doing 4?
    expect(medplumSearch).toHaveBeenLastCalledWith('Patient', { name: 'homer' });
    expect(medplumSearch).toHaveBeenCalledTimes(3); 
  });
});