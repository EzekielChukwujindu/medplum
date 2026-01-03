// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export interface StatItem {
  /** Stat title */
  title: string;
  /** Stat value */
  value: string | number;
  /** Optional description */
  desc?: string;
  /** Optional icon */
  icon?: JSX.Element;
  /** Value color */
  valueColor?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'info';
}

export interface StatsProps {
  /** Array of stat items */
  readonly stats: StatItem[];
  /** Layout direction */
  readonly direction?: 'horizontal' | 'vertical';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Stats component using DaisyUI styling.
 * Displays key metrics in a row or column.
 * @param props
 */
export function Stats(props: StatsProps): JSX.Element {
  const directionClass = props.direction === 'vertical' ? 'stats-vertical' : '';

  const valueColorClass = (color?: string): string => {
    switch (color) {
      case 'primary': return 'text-primary';
      case 'secondary': return 'text-secondary';
      case 'accent': return 'text-accent';
      case 'success': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      case 'info': return 'text-info';
      default: return '';
    }
  };

  return (
    <div
      class={`stats shadow ${directionClass} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <For each={props.stats}>
        {(stat) => (
          <div class="stat">
            <Show when={stat.icon}>
              <div class="stat-figure">{stat.icon}</div>
            </Show>
            <div class="stat-title">{stat.title}</div>
            <div class={`stat-value ${valueColorClass(stat.valueColor)}`}>{stat.value}</div>
            <Show when={stat.desc}>
              <div class="stat-desc">{stat.desc}</div>
            </Show>
          </div>
        )}
      </For>
    </div>
  );
}
