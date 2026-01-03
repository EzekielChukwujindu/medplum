// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { Collapsible as KobalteCollapsible } from '@kobalte/core/collapsible';
import { Accordion as KobalteAccordion } from '@kobalte/core/accordion';
import type { JSX, ParentProps } from 'solid-js';
import { For } from 'solid-js';
import { ChevronDown } from 'lucide-solid';

export interface CollapseProps extends ParentProps {
  /** Title shown in the header */
  readonly title: string;
  /** Whether collapsed by default */
  readonly defaultOpen?: boolean;
  /** Controlled open state */
  readonly open?: boolean;
  /** Callback when toggle clicked */
  readonly onToggle?: (open: boolean) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Collapse component using Kobalte for accessibility.
 * Expandable/collapsible content section with proper keyboard support.
 * @param props
 */
export function Collapse(props: CollapseProps): JSX.Element {
  return (
    <KobalteCollapsible
      open={props.open}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onToggle}
      class={`collapse bg-base-200 rounded-box ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <KobalteCollapsible.Trigger
        class="collapse-title text-lg font-medium flex items-center justify-between w-full cursor-pointer hover:bg-base-300 rounded-box px-4 py-3"
      >
        <span>{props.title}</span>
        <ChevronDown class="w-5 h-5 transition-transform ui-expanded:rotate-180" />
      </KobalteCollapsible.Trigger>
      <KobalteCollapsible.Content class="collapse-content px-4 pb-4">
        {props.children}
      </KobalteCollapsible.Content>
    </KobalteCollapsible>
  );
}

export interface AccordionItem {
  /** Unique key for this item */
  key: string;
  /** Title shown in header */
  title: string;
  /** Content shown when expanded */
  content: JSX.Element;
  /** Whether item is disabled */
  disabled?: boolean;
}

export interface AccordionProps {
  /** Array of accordion items */
  readonly items: AccordionItem[];
  /** Allow multiple items open at once */
  readonly multiple?: boolean;
  /** Default open items */
  readonly defaultOpen?: string[];
  /** Controlled open items */
  readonly value?: string[];
  /** Callback when open items change */
  readonly onChange?: (value: string[]) => void;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Accordion component using Kobalte for accessibility.
 * Multiple collapsible sections with proper keyboard navigation.
 * @param props
 */
export function Accordion(props: AccordionProps): JSX.Element {
  return (
    <KobalteAccordion
      multiple={props.multiple}
      defaultValue={props.defaultOpen}
      value={props.value}
      onChange={props.onChange}
      class={`space-y-2 ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <For each={props.items}>
        {(item) => (
          <KobalteAccordion.Item
            value={item.key}
            disabled={item.disabled}
            class="collapse bg-base-200 rounded-box"
          >
            <KobalteAccordion.Header class="collapse-title">
              <KobalteAccordion.Trigger
                class="text-lg font-medium flex items-center justify-between w-full cursor-pointer hover:bg-base-300 rounded-box px-4 py-3"
              >
                <span>{item.title}</span>
                <ChevronDown class="w-5 h-5 transition-transform ui-expanded:rotate-180" />
              </KobalteAccordion.Trigger>
            </KobalteAccordion.Header>
            <KobalteAccordion.Content class="collapse-content px-4 pb-4">
              {item.content}
            </KobalteAccordion.Content>
          </KobalteAccordion.Item>
        )}
      </For>
    </KobalteAccordion>
  );
}

// Export primitives for advanced use cases
export { KobalteCollapsible as CollapsePrimitive, KobalteAccordion as AccordionPrimitive };
