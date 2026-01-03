// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';

export interface LoadingProps {
  /** Size of the loading spinner. Defaults to 'md'. */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  class?: string;
}

/**
 * Loading spinner component using DaisyUI.
 * Centers the spinner in the viewport by default.
 * @param props
 */
export function Loading(props: LoadingProps = {}): JSX.Element {
  const sizeClass = () => {
    switch (props.size) {
      case 'xs': return 'loading-xs';
      case 'sm': return 'loading-sm';
      case 'lg': return 'loading-lg';
      default: return 'loading-md';
    }
  };

  return (
    <div class={`flex items-center justify-center w-full h-screen ${props.class ?? ''}`}>
      <span class={`loading loading-spinner loading-primary ${sizeClass()}`} />
    </div>
  );
}
