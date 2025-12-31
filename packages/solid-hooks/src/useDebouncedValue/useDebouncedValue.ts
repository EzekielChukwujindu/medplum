// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { createEffect, createSignal, onCleanup, type Accessor } from 'solid-js';

export type UseDebouncedValueOptions = {
  /** Whether the first update to `value` should be immediate or not */
  leading?: boolean;
};

/**
 * This hook allows users to debounce an incoming value by a specified number of milliseconds.
 * * @param value - The value to debounce.
 * @param waitMs - How long in milliseconds should.
 * @param options - Optional options for configuring the debounce.
 * @returns An array tuple of `[debouncedValue, cancelFn]`.
 */
export function useDebouncedValue<T = any>(
  value: T | Accessor<T>,
  waitMs: number,
  options: UseDebouncedValueOptions = { leading: false }
): [Accessor<T>, () => void] {
  // Resolve initial value
  const initialValue = typeof value === 'function' ? (value as Accessor<T>)() : value;
  const [debouncedValue, setDebouncedValue] = createSignal(initialValue);
  
  let mounted = false;
  let timeoutRef: ReturnType<typeof setTimeout> | undefined;
  let cooldownRef = false;

  const cancel = () => {
    if (timeoutRef) {
      clearTimeout(timeoutRef);
    }
  };

  createEffect(() => {
    // Access value to track it
    const currentValue = typeof value === 'function' ? (value as Accessor<T>)() : value;

    if (mounted) {
      if (!cooldownRef && options.leading) {
        cooldownRef = true;
        setDebouncedValue(() => currentValue);
      } else {
        cancel();
        timeoutRef = setTimeout(() => {
          cooldownRef = false;
          setDebouncedValue(() => currentValue);
        }, waitMs);
      }
    } else {
      mounted = true;
    }
  });

  onCleanup(cancel);

  // Return the accessor directly
  return [debouncedValue, cancel];
}