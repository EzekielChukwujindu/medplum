// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { isString, locationUtils } from '@medplum/core';
import { useMedplumNavigate } from '@medplum/solid-hooks';
import type { JSX, ParentProps } from 'solid-js';
import { createSignal, For } from 'solid-js';

export interface TabDefinition {
  readonly label: string;
  readonly value: string;
}

export interface LinkTabsProps extends ParentProps {
  /** Base URL for tab navigation */
  readonly baseUrl: string;
  /** Tab definitions (strings or {label, value} objects) */
  readonly tabs: string[] | TabDefinition[];
  /** CSS class for tabs container */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * LinkTabs provides tab navigation using URL routing.
 * Each tab links to a sub-path under the baseUrl.
 * @param props
 */
export function LinkTabs(props: LinkTabsProps): JSX.Element {
  const normalizedTabs = () => normalizeTabDefinitions(props.tabs);
  const navigate = useMedplumNavigate();

  const getInitialTab = (): string => {
    const tab = locationUtils.getPathname().split('/').pop();
    const tabs = normalizedTabs();
    return tab && tabs.some((t) => t.value === tab) ? tab : tabs[0]?.value ?? '';
  };

  const [currentTab, setCurrentTab] = createSignal<string>(getInitialTab());

  function onTabChange(newTabValue: string): void {
    setCurrentTab(newTabValue);
    navigate(`${props.baseUrl}/${newTabValue}`);
  }

  function handleClick(e: MouseEvent, tabValue: string): void {
    // Allow ctrl+click or middle click to open in new tab
    if ((e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey || (e as MouseEvent).button === 1) {
      return;
    }
    e.preventDefault();
    onTabChange(tabValue);
  }

  return (
    <div class={props.class} data-testid={props.testId}>
      <div role="tablist" class="tabs tabs-bordered">
        <For each={normalizedTabs()}>
          {(tab) => (
            <a
              role="tab"
              class={`tab ${currentTab() === tab.value ? 'tab-active' : ''}`}
              href={`${props.baseUrl}/${tab.value}`}
              onClick={(e) => handleClick(e, tab.value)}
            >
              {tab.label}
            </a>
          )}
        </For>
      </div>
      {props.children}
    </div>
  );
}

function normalizeTabDefinitions(tabs: string[] | TabDefinition[]): TabDefinition[] {
  return tabs.map((t) => (isString(t) ? { label: t, value: t.toLowerCase() } : t));
}
