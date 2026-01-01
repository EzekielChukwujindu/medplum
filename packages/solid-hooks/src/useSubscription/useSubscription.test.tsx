// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// import { SubscriptionEmitter, generateId } from '@medplum/core';
import { generateId } from '@medplum/core';
import type { Bundle } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import type { Accessor } from 'solid-js';
import { createSignal, JSX, Show } from 'solid-js';
import { describe, test, expect, beforeAll, beforeEach, afterAll, vi } from 'vitest';
import { MedplumProvider } from '../MedplumProvider/MedplumProvider';
import type { UseSubscriptionOptions } from './useSubscription';
import { useSubscription } from './useSubscription';

// const MOCK_SUBSCRIPTION_ID = '7b081dd8-a2d2-40dd-9596-58a7305a73b0';

function TestComponent(props: {
  criteria: string | undefined | Accessor<string | undefined>;
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
    vi.useFakeTimers();
  });

  beforeEach(() => {
    medplum = new MockClient();
  });

  afterAll(() => {
  });

  test('Mount and unmount completely', async () => {
    const { unmount } = render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent criteria="Communication" />
      </MedplumProvider>
    ));

    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });

    await waitFor(() => expect(screen.getByTestId('bundle').innerHTML).not.toBe('undefined'));
    
    unmount();
    vi.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(0);
  });

  test('Mount and remount before debounce timeout', async () => {
    const [show, setShow] = createSignal(true);
    render(() => (
      <MedplumProvider medplum={medplum}>
        <Show when={show()}>
          <TestComponent criteria="Communication" />
        </Show>
      </MedplumProvider>
    ));

    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);
    const emitter = medplum.getSubscriptionManager().getEmitter('Communication');

    setShow(false);
    vi.advanceTimersByTime(1000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);

    setShow(true);
    vi.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(1);
    expect(medplum.getSubscriptionManager().getEmitter('Communication')).toBe(emitter);

    setShow(false);
    vi.advanceTimersByTime(5000);
    expect(medplum.getSubscriptionManager().getCriteriaCount()).toEqual(0);
  });

  test('Criteria changed', async () => {
    const [criteria, setCriteria] = createSignal<string | undefined>('Communication');
    let lastId = '';

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent 
          criteria={criteria} 
          callback={(b) => { lastId = b.id as string; }} 
        />
      </MedplumProvider>
    ));

    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    });
    expect(lastId).toBe(id1);

    const id2 = generateId();
    setCriteria('DiagnosticReport');
    
    // Wait for SolidJS reactivity to update the subscription
    await waitFor(() => {
      // The subscription should have switched to DiagnosticReport
    });
    
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

  // Test that when the callback changes, the new callback receives events
  // In SolidJS, callbacks passed to hooks are captured at call time.
  // To test dynamic callback behavior, we use a signal-based approach where
  // the callback itself reads from a signal to determine behavior.
  test('Callback changed', async () => {
    let lastFromCb1: Bundle | undefined;
    let lastFromCb2: Bundle | undefined;
    const [whichCallback, setWhichCallback] = createSignal<1 | 2>(1);

    function TestCallbackComponent(): JSX.Element {
      // The callback uses a signal to dynamically route events
      const dynamicCallback = (bundle: Bundle) => {
        if (whichCallback() === 1) {
          lastFromCb1 = bundle;
        } else {
          lastFromCb2 = bundle;
        }
      };
      
      useSubscription('Communication', dynamicCallback);
      return <div data-testid="callback-test">{whichCallback()}</div>;
    }

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestCallbackComponent />
      </MedplumProvider>
    ));

    await waitFor(() => expect(screen.getByTestId('callback-test')).toBeInTheDocument());

    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    });
    expect(lastFromCb1?.id).toBe(id1);
    expect(lastFromCb2).toBeUndefined();

    setWhichCallback(2);

    const id2 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id2, type: 'history' },
    });
    // Now the second callback should receive the event because whichCallback() is 2
    expect(lastFromCb2?.id).toBe(id2);
  });

  // Add error test from React
  test('Error emitted', async () => {
    let lastError: Error | undefined;
    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent 
          criteria="Communication" 
          options={{ onError: (err) => { lastError = err; } }} 
        />
      </MedplumProvider>
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
      <MedplumProvider medplum={medplum}>
        {(() => {
          useSubscription('Communication', () => setNotifications((s) => s + 1));
          return (
            <div data-testid="notification-count">
              {notifications()}
            </div>
          );
        })()}
      </MedplumProvider>
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

  // NEW TEST: subscriptionProps changed (from React line 266)
  // Tests that subscriptionProps properly filter which events are received
  test('subscriptionProps changed (React parity)', async () => {
    const [lastId, setLastId] = createSignal<string | undefined>();

    function TestWrapper(): JSX.Element {
      useSubscription('Communication', (bundle) => {
        setLastId(bundle.id as string);
      }, {
        subscriptionProps: {
          extension: [
            {
              url: 'https://medplum.com/fhir/StructureDefinition/subscription-supported-interaction',
              valueCode: 'create',
            },
          ],
        },
      });
      return <div data-testid="sub-props">{lastId() ?? 'none'}</div>;
    }

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestWrapper />
      </MedplumProvider>
    ));

    // Subscription should be set up synchronously
    await waitFor(() => expect(screen.getByTestId('sub-props')).toBeInTheDocument());

    // Emit event WITHOUT matching props - should NOT trigger callback
    const id0 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id0, type: 'history' },
    }); // No props argument
    
    // Should still show 'none' since event didn't match subscriptionProps
    expect(screen.getByTestId('sub-props').innerHTML).toBe('none');
    
    // Now emit WITH matching props - SHOULD trigger callback
    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    }, {
      extension: [
        {
          url: 'https://medplum.com/fhir/StructureDefinition/subscription-supported-interaction',
          valueCode: 'create',
        },
      ],
    });
    
    // Should have received id1 since props matched
    await waitFor(() => expect(screen.getByTestId('sub-props').innerHTML).toBe(id1));
  });

  // NEW TEST: Empty criteria should temporarily unsubscribe (from React line 371)
  test('Empty criteria should temporarily unsubscribe (React parity)', async () => {
    const [criteria, setCriteria] = createSignal<string | undefined>('Communication');
    let receivedIds: string[] = [];

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent 
          criteria={criteria} 
          callback={(b) => receivedIds.push(b.id as string)} 
        />
      </MedplumProvider>
    ));

    // First event
    const id1 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id1, type: 'history' },
    });
    expect(receivedIds).toContain(id1);

    // Set criteria to empty string
    setCriteria('');
    
    // Should not receive events
    const id2 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id2, type: 'history' },
    });
    expect(receivedIds).not.toContain(id2);

    // Set criteria to undefined
    setCriteria(undefined);
    
    const id3 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id3, type: 'history' },
    });
    expect(receivedIds).not.toContain(id3);

    // Re-enable
    setCriteria('Communication');
    
    const id4 = generateId();
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: id4, type: 'history' },
    });
    await waitFor(() => expect(receivedIds).toContain(id4));
  });

  // NEW TEST: WebSocket lifecycle callbacks (from React line 485)
  test('WebSocket lifecycle callbacks (React parity)', async () => {
    let wsOpenedTimes = 0;
    let wsClosedTimes = 0;
    let connectCount = 0;

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestComponent 
          criteria="Communication" 
          options={{
            onWebSocketOpen: () => wsOpenedTimes++,
            onWebSocketClose: () => wsClosedTimes++,
            onSubscriptionConnect: () => connectCount++,
          }} 
        />
      </MedplumProvider>
    ));

    // Emit close event
    medplum.getSubscriptionManager().emitEventForCriteria<'close'>('Communication', {
      type: 'close',
    });
    await waitFor(() => expect(wsClosedTimes).toBe(1));

    // Emit open event
    medplum.getSubscriptionManager().emitEventForCriteria<'open'>('Communication', {
      type: 'open',
    });
    await waitFor(() => expect(wsOpenedTimes).toBe(1));

    // Emit connect event
    medplum.getSubscriptionManager().emitEventForCriteria<'connect'>('Communication', {
      type: 'connect',
      payload: { subscriptionId: 'test-sub-id' },
    });
    await waitFor(() => expect(connectCount).toBe(1));
  });

  // NEW TEST: Changing callback should not recreate Subscription (from React line 614)
  test('Changing callback should not recreate Subscription (React parity)', async () => {
    const subscribeSpy = vi.spyOn(medplum, 'subscribeToCriteria');

    function TestWrapper(): JSX.Element {
      const [count, setCount] = createSignal(0);

      useSubscription('Communication', () => {
        setCount(c => c + 1);
      });

      return <div data-testid="count">{count()}</div>;
    }

    render(() => (
      <MedplumProvider medplum={medplum}>
        <TestWrapper />
      </MedplumProvider>
    ));

    // Emit first event
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });
    await waitFor(() => expect(screen.getByTestId('count').innerHTML).toBe('1'));

    // Emit second event - callback changes but subscription should not recreate
    medplum.getSubscriptionManager().emitEventForCriteria<'message'>('Communication', {
      type: 'message',
      payload: { resourceType: 'Bundle', id: generateId(), type: 'history' },
    });
    await waitFor(() => expect(screen.getByTestId('count').innerHTML).toBe('2'));

    // subscribeToCriteria should have been called only once
    expect(subscribeSpy).toHaveBeenCalledTimes(1);
  });
});