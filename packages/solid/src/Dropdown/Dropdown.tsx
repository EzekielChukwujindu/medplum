// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export interface DropdownItem {
  /** Unique key */
  key?: string;
  /** Display label */
  label: string;
  /** Whether disabled */
  disabled?: boolean;
  /** Optional icon */
  icon?: JSX.Element;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  class?: string;
}

export interface DropdownProps {
  /** Button/trigger label or custom element */
  readonly label?: string | JSX.Element;
  /** Custom trigger element */
  readonly trigger?: JSX.Element;
  /** Dropdown items */
  readonly items: DropdownItem[];
  /** Callback when item selected */
  readonly onSelect?: (key: string) => void;
  /** Dropdown position */
  readonly position?: 'bottom' | 'top' | 'left' | 'right';
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Dropdown component using DaisyUI styling.
 * Click trigger to show menu items.
 * @param props
 */
export function Dropdown(props: DropdownProps): JSX.Element {
  const positionClass = (): string => {
    switch (props.position) {
      case 'top': return 'dropdown-top';
      case 'left': return 'dropdown-left';
      case 'right': return 'dropdown-right';
      default: return '';
    }
  };

  const handleItemClick = (item: DropdownItem): void => {
    if (item.disabled) {return;}
    
    // Call item's onClick if provided
    if (item.onClick) {
      item.onClick();
    }
    
    // Call onSelect with key if provided
    if (item.key && props.onSelect) {
      props.onSelect(item.key);
    }
  };

  return (
    <div
      class={`dropdown ${positionClass()} ${props.class ?? ''}`}
      data-testid={props.testId}
    >
      <Show when={props.trigger} fallback={
        <div tabindex="0" role="button" class="btn m-1">
          {props.label}
        </div>
      }>
        {props.trigger}
      </Show>
      <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow">
        <For each={props.items}>
          {(item, index) => (
            <li class={`${item.disabled ? 'disabled' : ''} ${item.class ?? ''}`}>
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => handleItemClick(item)}
                data-testid={`${props.testId ?? 'dropdown'}-item-${item.key ?? index()}`}
              >
                <Show when={item.icon}>
                  {item.icon}
                </Show>
                {item.label}
              </button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
