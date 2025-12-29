// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { SubscriptionEmitter, generateId } from '@medplum/core';
import type { Bundle } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { createSignal, JSX, Show } from 'solid-js';
import { MemoryRouter } from '@solidjs/router';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import type { UseSubscriptionOptions } from './useSubscription';
import { useSubscription } from './useSubscription';

const MOCK_SUBSCRIPTION_ID = '7b081dd8-a2d2-40dd-9596-58a7305a73b0';

function TestComponent(props: {
  criteria: string | undefined;
  callback?: (bundle: Bundle) => void;
  options?: UseSubscriptionOptions;
}): JSX.Element {
  const [lastReceived, setLastReceived] = createSignal<Bundle>();
  useSubscription(
    props.criteria,
    props.callback ?? ((bundle: Bundle) => setLastReceived(bundle)),
    props.options
  );
  return (
    <div>
      <div data-testid="bundle">{JSON.stringify(lastReceived())}</div>
    </div>
  );
}

describe('useSubscription()', () => {
  let medplum: MockClient;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    medplum = new MockClient();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('Mount and unmount completely', async () => {
    const { unmount } = render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <TestComponent criteria="Communication" />
        </MedplumProvider>
      </MemoryRouter>
    ));

    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });

    await waitFor(() => expect(screen.getByTestId('bundle').innerHTML).not.toBe('undefined'));
    
    unmount();
    jest.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(0);
  });

  test('Mount and remount before debounce timeout', async () => {
    const [show, setShow] = createSignal(true);
    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <Show when={show()}>
            <TestComponent criteria="Communication" />
          </Show>
        </MedplumProvider>
      </MemoryRouter>
    ));

    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);
    const emitter = medplum.getSubscriptionManager().getEmitter('Communication');

    setShow(false);
    jest.advanceTimersByTime(1000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);

    setShow(true);
    jest.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);
    expect(medplum.getSubscriptionManager().getEmitter('Communication')).toBe(emitter);

    setShow(false);
    jest.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(0);
  });

  test('Criteria changed', async () => {
    const [criteria, setCriteria] = createSignal('Communication');
    let lastId = '';

    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <TestComponent 
            criteria={criteria()} 
            callback={(b) => { lastId = b.id as string; }} 
          />
        </MedplumProvider>
      </MemoryRouter>
    ));

    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    });
    expect(lastId).toBe(id1);

    const id2 = generateId();
    setCriteria('DiagnosticReport');
    
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id2, type: 'history' },
    });
    expect(lastId).toBe(id1); // No update from old

    const id3 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('DiagnosticReport', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id3, type: 'history' },
    });
    expect(lastId).toBe(id3);
  });

  // Add missing from React (e.g., callback change)
  test('Callback changed', async () => {
    let lastFromCb1: Bundle | undefined;
    let lastFromCb2: Bundle | undefined;
    const [callback, setCallback] = createSignal<(bundle: Bundle) => void>((bundle) => { lastFromCb1 = bundle; });

    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <TestComponent criteria="Communication" callback={callback()} />
        </MedplumProvider>
      </MemoryRouter>
    ));

    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    });
    expect(lastFromCb1?.id).toBe(id1);

    setCallback(() => (bundle) => { lastFromCb2 = bundle; });

    const id2 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id2, type: 'history' },
    });
    expect(lastFromCb2?.id).toBe(id2);
  });

  // Add error test from React
  test('Error emitted', async () => {
    let lastError: Error | undefined;
    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <TestComponent 
            criteria="Communication" 
            options={{ onError: (err) => { lastError = err; } }} 
          />
        </MedplumProvider>
      </MemoryRouter>
    ));

    medplum.getSubscriptionManager().emitEventForCriteria<'error'>('Communication', {
      type: 'error',
      payload: new Error('Something is broken'),
    });

    await waitFor(() => expect(lastError).toEqual(new Error('Something is broken')));
  });

  // Add more from truncated React (e.g., only one call per update, changing callback no recreate)
  test('Only get one call per update', async () => {
    const [notifications, setNotifications] = createSignal(0);
    render(() => (
      <MemoryRouter>
        <MedplumProvider medplum={medplum}>
          <div data-testid="notification-count">
            {useSubscription('Communication', () => setNotifications((s) => s + 1)), notifications()}
          </div>
        </MedplumProvider>
      </MemoryRouter>
    ));

    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });

    await waitFor(() => expect(screen.getByTestId('notification-count').innerHTML).toContain('1'));

    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });

    expect(screen.getByTestId('notification-count').innerHTML).toContain('2');
  });

  // ... Add other truncated tests similarly (e.g., options with extensions, WS open/close)
});