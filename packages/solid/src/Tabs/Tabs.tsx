// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Tabs as KobalteTabs } from '@kobalte/core/tabs';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';

export interface TabItem {
  /** Tab label */
  label: string;
  /** Tab value/key */
  value: string;
  /** Tab content */
  content: JSX.Element;
  /** Whether tab is disabled */
  disabled?: boolean;
}

export interface TabsProps {
  /** Array of tab items */
  readonly tabs: TabItem[];
  /** Currently active tab value */
  readonly value?: string;
  /** Default active tab value */
  readonly defaultValue?: string;
  /** Callback when tab changes */
  readonly onChange?: (value: string) => void;
  /** Tab style variant */
  readonly variant?: 'bordered' | 'lifted' | 'boxed';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Tabs component using Kobalte for accessibility.
 * Provides proper keyboard navigation and ARIA attributes.
 * @param props
 */
export function Tabs(props: TabsProps): JSX.Element {
  const tabClass = (): string => {
    const base = 'tabs';
    switch (props.variant) {
      case 'bordered': return `${base} tabs-bordered`;
      case 'lifted': return `${base} tabs-lifted`;
      case 'boxed': return `${base} tabs-boxed`;
      default: return `${base} tabs-bordered`;
    }
  };

  return (
    <KobalteTabs
      value={props.value}
      defaultValue={props.defaultValue ?? props.tabs[0]?.value}
      onChange={props.onChange}
      class={props.class}
    >
      <KobalteTabs.List class={tabClass()} data-testid={props.testId}>
        <For each={props.tabs}>
          {(tab) => (
            <KobalteTabs.Trigger
              value={tab.value}
              disabled={tab.disabled}
              class="tab ui-selected:tab-active"
              data-testid={`${props.testId ?? 'tabs'}-tab-${tab.value}`}
            >
              {tab.label}
            </KobalteTabs.Trigger>
          )}
        </For>
        <KobalteTabs.Indicator class="tab-indicator" />
      </KobalteTabs.List>
      
      <For each={props.tabs}>
        {(tab) => (
          <KobalteTabs.Content value={tab.value} class="p-4">
            {tab.content}
          </KobalteTabs.Content>
        )}
      </For>
    </KobalteTabs>
  );
}

// Export primitive for advanced use cases
export { KobalteTabs as TabsPrimitive };
