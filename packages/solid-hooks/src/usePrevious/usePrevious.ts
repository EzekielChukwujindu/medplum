// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createEffect, createSignal, type Accessor } from 'solid-js';

/**
 * Solid Hook to keep track of the passed-in value from the previous "update" of the value.
 * @param value - The value to track (usually a prop).
 * @returns The value passed in from the previous reactive update.
 */
export function usePrevious<T>(value: T | Accessor<T>): Accessor<T | undefined> {
  const [prev, setPrev] = createSignal<T | undefined>(undefined);
  let lastValue: T | undefined = undefined;

  createEffect(() => {
    // When value changes, we update the signal with the 'lastValue' 
    // before updating 'lastValue' itself.
    setPrev(() => lastValue);
    lastValue = typeof value === 'function' ? (value as Accessor<T>)() : value;
  });

  return prev;
}