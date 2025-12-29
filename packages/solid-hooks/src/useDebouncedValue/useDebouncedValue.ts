// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0

import { createEffect, createSignal, onCleanup } from 'solid-js';

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
  value: T,
  waitMs: number,
  options: UseDebouncedValueOptions = { leading: false }
): [T, () => void] {
  const [debouncedValue, setDebouncedValue] = createSignal(value);
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
    const currentValue = value;

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

  // We return a getter for the first element to maintain reactivity in Solid
  return [debouncedValue(), cancel] as [T, () => void];
}