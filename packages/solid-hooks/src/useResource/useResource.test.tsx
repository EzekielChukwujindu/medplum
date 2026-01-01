// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type { OperationOutcome, Reference, Resource, ServiceRequest } from '@medplum/fhirtypes';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { render, screen, waitFor, fireEvent } from '@solidjs/testing-library';
import { createEffect, createSignal, JSX, type Accessor } from 'solid-js';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useResource } from './useResource';

interface TestComponentProps {
  value?: Reference | Resource | Accessor<Reference | Partial<Resource> | undefined>;
  setOutcome?: (outcome: OperationOutcome) => void;
  maxRenders?: number;
}

function TestComponent(props: TestComponentProps): JSX.Element {
  let renderCount = 0;
  const maxRenders = props.maxRenders ?? 5;
  const resource = useResource(props.value, props.setOutcome);

  createEffect(() => {
     renderCount++;
        if (maxRenders > 0 && renderCount > maxRenders) {
          throw new Error(`Rendered too many times: ${renderCount}`);
        }
  });

  return (
    <div data-testid="test-component">
      {JSON.stringify(resource())}
    </div>
  );
}

describe('useResource', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
  });

  function setup(Component: () => JSX.Element) {
    return render(() => (
      <MedplumProvider medplum={medplum}>
        <Component />
      </MedplumProvider>
    ));
  }

  test('Renders null', () => {
    setup(() => <TestComponent value={null as any} />); // Cast to any for test
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe('');
  });

  test('Renders undefined', () => {
    setup(() => <TestComponent value={undefined} />);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe('');
  });

  test('Handles invalid value', () => {
    setup(() => <TestComponent value={{} as any} />);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe('');
  });

  test('Renders resource', () => {
    setup(() => <TestComponent value={HomerSimpson} />);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).not.toBe('');
  });

  test('Renders reference', async () => {
    setup(() => <TestComponent value={createReference(HomerSimpson)} />);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe(''); // Initial undefined
    await waitFor(() => expect(el.innerHTML).not.toBe(''));
  });

  test('Renders system', async () => {
    setup(() => <TestComponent value={{ reference: 'system' }} />);
    const el = screen.getByTestId('test-component');
    await waitFor(() => expect(el.innerHTML).not.toBe(''));
  });

  test('Handles 404 not found', async () => {
    setup(() => <TestComponent value={{ reference: 'Patient/not-found' }} />);
    const el = screen.getByTestId('test-component');
    await waitFor(() => expect(el.innerHTML).toBe(''));
  });

  test('Set outcome on error', async () => {
    const [outcome, setOutcome] = createSignal<OperationOutcome>();
    medplum.readReference = vi.fn().mockRejectedValue({ resourceType: 'OperationOutcome', issue: [] });
    setup(() => <TestComponent value={{ reference: 'Patient/not-found' }} setOutcome={setOutcome} />);
    await waitFor(() => expect(outcome()).toBeDefined());
  });

  // Test that when the reference ID changes, the hook uses the new partial resource directly
  // (matches React behavior - partial resources are not fetched, just used as-is)
  test('Responds to value change', async () => {
    function TestWrapper(): JSX.Element {
      const [id, setId] = createSignal('123');
      const resource = useResource(() => ({ id: id(), resourceType: 'ServiceRequest' } as Partial<ServiceRequest>));
      
      return (
        <>
          <button onClick={() => setId('456')}>Click</button>
          <div data-testid="test-component">{JSON.stringify(resource())}</div>
        </>
      );
    }
    setup(TestWrapper);
    const el = screen.getByTestId('test-component');
    await waitFor(() => expect(el.innerHTML).toContain('123'));
    fireEvent.click(screen.getByText('Click'));
    // Partial resources are used directly, so '456' should appear
    await waitFor(() => expect(el.innerHTML).toContain('456'));
  });

  test('Responds to value edit', async () => {
    function TestWrapper(): JSX.Element {
      const [resource, setResource] = createSignal<ServiceRequest>({
        resourceType: 'ServiceRequest',
        id: '123',
        status: 'draft',
        intent: 'order',
        code: { text: 'test' },
        subject: { reference: 'Patient/123' },
      });

      // Pass the signal accessor directly
      return (
        <>
          <button onClick={() => setResource((sr) => ({ ...sr, status: sr.status === 'active' ? 'draft' : 'active' }))}>
            Click
          </button>
          <TestComponent value={resource} />
        </>
      );
    }

    setup(TestWrapper);

    const el = screen.getByTestId('test-component');
    await waitFor(() => expect(el.innerHTML).toContain('"status":"draft"'));

    fireEvent.click(screen.getByText('Click'));
    await waitFor(() => expect(el.innerHTML).toContain('"status":"active"'));
  });

  test('Responds to value edit after cache', async () => {
    // Similar to React: pre-fetch to cache, then edit
    function TestWrapper(): JSX.Element {
      useResource({ reference: 'ServiceRequest/123' }); // Cache fill
      const [resource, setResource] = createSignal<ServiceRequest>({
        resourceType: 'ServiceRequest',
        id: '123',
        status: 'draft',
        intent: 'order',
        code: { text: 'test' },
        subject: { reference: 'Patient/123' },
      });

      // Pass the signal accessor (resource) instead of the evaluated value (resource())
      // to enable proper reactivity tracking in SolidJS
      const result = useResource(resource);

      return (
        <>
          <button onClick={() => setResource((sr) => ({ ...sr, status: sr.status === 'active' ? 'draft' : 'active' }))}>
            Click
          </button>
          <div data-testid="test-component">{JSON.stringify(result())}</div>
        </>
      );
    }

    setup(TestWrapper);

    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toContain('"status":"draft"');

    fireEvent.click(screen.getByText('Click'));
    await waitFor(() => expect(el.innerHTML).toContain('"status":"active"'));
  });


});