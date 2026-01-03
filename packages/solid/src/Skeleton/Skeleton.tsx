// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';

export interface SkeletonProps {
  /** Width (CSS value) */
  readonly width?: string;
  /** Height (CSS value) */
  readonly height?: string;
  /** Whether circular */
  readonly circle?: boolean;
  /** Additional CSS class */
  readonly class?: string;
}

/**
 * Skeleton loading placeholder.
 * @param props
 */
export function Skeleton(props: SkeletonProps): JSX.Element {
  const style = {
    width: props.width,
    height: props.height ?? (props.circle ? props.width : '1rem'),
  };

  return (
    <div
      class={`skeleton ${props.circle ? 'rounded-full' : ''} ${props.class ?? ''}`}
      style={style}
    />
  );
}

export interface SkeletonTextProps {
  /** Number of lines */
  readonly lines?: number;
  /** Additional CSS class */
  readonly class?: string;
}

/**
 * SkeletonText - multiple skeleton lines for text placeholders.
 * @param props
 */
export function SkeletonText(props: SkeletonTextProps): JSX.Element {
  const lines = props.lines ?? 3;
  return (
    <div class={`space-y-2 ${props.class ?? ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          class="skeleton h-4"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
}
