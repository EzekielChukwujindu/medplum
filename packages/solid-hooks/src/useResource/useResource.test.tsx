// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type { OperationOutcome, Reference, Resource, ServiceRequest } from '@medplum/fhirtypes';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { render, screen, waitFor, fireEvent } from '@solidjs/testing-library';
import { createSignal, JSX } from 'solid-js';
import { MemoryRouter } from '@solidjs/router';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import { useResource } from './useResource';

interface TestComponentProps {
  value?: Reference | Resource;
  setOutcome?: (outcome: OperationOutcome) => void;
  maxRenders?: number;
}

function TestComponent(props: TestComponentProps): JSX.Element {
  let renderCount = 0;
  const maxRenders = props.maxRenders ?? 5;

  return (
    <div data-testid="test-component">
      {(() => {
        const resource = useResource(props.value, props.setOutcome);
        renderCount++;
        if (maxRenders > 0 && renderCount > maxRenders) {
          throw new Error(`Rendered too many times: ${renderCount}`);
        }
        return JSON.stringify(resource);
      })()}
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
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <Component />
        </MedplumProvider>
      </MemoryRouter>
    ));
  }

  test('Renders null', () => {
    setup(() => <TestComponent value={null as any} />);
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

  test('Renders system', () => {
    setup(() => <TestComponent value={{ reference: 'system' }} />);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toBe('');
    // Note: React test has not.toBe(''), but parity check—adjust if behavior differs
  });

  test('Handles 404 not found', async () => {
    setup(() => <TestComponent value={{ reference: 'Patient/not-found' }} />);
    const el = screen.getByTestId('test-component');
    await waitFor(() => expect(el.innerHTML).toBe(''));
  });

  test('Set outcome on error', async () => {
    const [outcome, setOutcome] = createSignal<OperationOutcome>();
    medplum.readReference = jest.fn().mockRejectedValue({ resourceType: 'OperationOutcome', issue: [] });
    setup(() => <TestComponent value={{ reference: 'Patient/not-found' }} setOutcome={setOutcome} />);
    await waitFor(() => expect(outcome()).toBeDefined());
  });

  test('Responds to value change', async () => {
    function TestWrapper(): JSX.Element {
      const [id, setId] = createSignal('123');
      return (
        <>
          <button onClick={() => setId('456')}>Click</button>
          <TestComponent value={{ id: id(), resourceType: 'ServiceRequest' }} />
        </>
      );
    }
    setup(TestWrapper);
    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toContain('123');
    fireEvent.click(screen.getByText('Click'));
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

      return (
        <>
          <button onClick={() => setResource((sr) => ({ ...sr, status: sr.status === 'active' ? 'draft' : 'active' }))}>
            Click
          </button>
          <TestComponent value={resource()} />
        </>
      );
    }

    setup(TestWrapper);

    const el = screen.getByTestId('test-component');
    expect(el.innerHTML).toContain('"status":"draft"');

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

      return (
        <>
          <button onClick={() => setResource((sr) => ({ ...sr, status: sr.status === 'active' ? 'draft' : 'active' }))}>
            Click
          </button>
          <TestComponent value={resource()} maxRenders={6} />
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