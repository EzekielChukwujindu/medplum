// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { SubscriptionEmitter, SubscriptionEventMap } from '@medplum/core';
import { deepEquals } from '@medplum/core';
import type { Bundle, Subscription } from '@medplum/fhirtypes';
import { createEffect, createMemo, createSignal, onCleanup, untrack, type Accessor } from 'solid-js';
import { useMedplum } from '../MedplumProvider/MedplumProvider.context';

const SUBSCRIPTION_DEBOUNCE_MS = 3000;

export type UseSubscriptionOptions = {
  subscriptionProps?: Partial<Subscription>;
  onWebSocketOpen?: () => void;
  onWebSocketClose?: () => void;
  onSubscriptionConnect?: (subscriptionId: string) => void;
  onSubscriptionDisconnect?: (subscriptionId: string) => void;
  onError?: (err: Error) => void;
};

/**
 * Solid Hook to use a FHIR subscription.
 *
 * @param criteria - The FHIR search criteria to subscribe to.
 * @param callback - The callback to call when a notification event `Bundle` is received.
 * @param options - Optional configuration options.
 */
export function useSubscription(
  criteria: string | undefined | Accessor<string | undefined>,
  callback: (bundle: Bundle) => void,
  options?: UseSubscriptionOptions
): void {
  const medplum = useMedplum();
  const [emitter, setEmitter] = createSignal<SubscriptionEmitter>();

  // Deep comparison memo for subscription props to prevent unnecessary resubscriptions
  const memoizedSubProps = createMemo(() => options?.subscriptionProps, undefined, {
    equals: (a, b) => deepEquals(a, b),
  });

  // Keep track of the latest callbacks without re-triggering the listener effect
  const latest = { callback, options };
  createEffect(() => {
    latest.callback = callback;
    latest.options = options;
  });

  let unsubTimer: any;
  let prevCriteria: string | undefined;
  let prevProps: Partial<Subscription> | undefined;

  createEffect(() => {
    const c = typeof criteria === 'function' ? (criteria as Accessor<string | undefined>)() : criteria;
    const p = memoizedSubProps();
    const m = medplum;

    if (unsubTimer) {
      clearTimeout(unsubTimer);
      unsubTimer = undefined;
    }

    // If criteria or props changed, unsubscribe from the old one and subscribe to the new one
    if (c !== prevCriteria || !deepEquals(p, prevProps)) {
      if (prevCriteria) {
        m.unsubscribeFromCriteria(prevCriteria, prevProps);
      }
      prevCriteria = c;
      prevProps = p;

      if (c) {
        setEmitter(m.subscribeToCriteria(c, p));
      } else {
        setEmitter(undefined);
      }
    }

    onCleanup(() => {
      unsubTimer = setTimeout(() => {
        if (prevCriteria) {
          m.unsubscribeFromCriteria(prevCriteria, prevProps);
        }
        setEmitter(undefined);
        prevCriteria = undefined;
        prevProps = undefined;
      }, SUBSCRIPTION_DEBOUNCE_MS);
    });
  });

  // Manage event listeners on the emitter
  createEffect(() => {
    const e = emitter();
    if (!e) return;

    const emitterCallback = (event: SubscriptionEventMap['message']): void =>
      untrack(() => latest.callback(event.payload));
    const onWebSocketOpen = (): void => untrack(() => latest.options?.onWebSocketOpen?.());
    const onWebSocketClose = (): void => untrack(() => latest.options?.onWebSocketClose?.());
    const onSubscriptionConnect = (event: SubscriptionEventMap['connect']): void =>
      untrack(() => latest.options?.onSubscriptionConnect?.(event.payload.subscriptionId));
    const onSubscriptionDisconnect = (event: SubscriptionEventMap['disconnect']): void =>
      untrack(() => latest.options?.onSubscriptionDisconnect?.(event.payload.subscriptionId));
    const onError = (event: SubscriptionEventMap['error']): void => untrack(() => latest.options?.onError?.(event.payload));

    e.addEventListener('message', emitterCallback);
    e.addEventListener('open', onWebSocketOpen);
    e.addEventListener('close', onWebSocketClose);
    e.addEventListener('connect', onSubscriptionConnect);
    e.addEventListener('disconnect', onSubscriptionDisconnect);
    e.addEventListener('error', onError);

    onCleanup(() => {
      e.removeEventListener('message', emitterCallback);
      e.removeEventListener('open', onWebSocketOpen);
      e.removeEventListener('close', onWebSocketClose);
      e.removeEventListener('connect', onSubscriptionConnect);
      e.removeEventListener('disconnect', onSubscriptionDisconnect);
      e.removeEventListener('error', onError);
    });
  });
}