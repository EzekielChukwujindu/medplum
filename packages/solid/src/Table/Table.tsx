// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';

export interface TableColumn<T> {
  /** Column key/accessor */
  key: string;
  /** Column header label */
  label: string;
  /** Custom cell renderer */
  render?: (item: T) => JSX.Element;
  /** Whether column is sortable */
  sortable?: boolean;
  /** Column width */
  width?: string;
}

export interface TableProps<T> {
  /** Array of data items */
  readonly data: T[];
  /** Column definitions */
  readonly columns: TableColumn<T>[];
  /** Row key accessor (default: 'id') */
  readonly rowKey?: keyof T | ((item: T) => string);
  /** Whether to show zebra striping */
  readonly zebra?: boolean;
  /** Whether to highlight rows on hover */
  readonly hover?: boolean;
  /** Show loading state */
  readonly loading?: boolean;
  /** Empty state message */
  readonly emptyMessage?: string;
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * Table component using DaisyUI styling.
 * @param props
 */
export function Table<T extends Record<string, any>>(props: TableProps<T>): JSX.Element {
  const _getRowKey = (item: T, index: number): string => {
    if (typeof props.rowKey === 'function') {
      return props.rowKey(item);
    }
    if (props.rowKey && item[props.rowKey] !== undefined) {
      return String(item[props.rowKey]);
    }
    if ('id' in item) {
      return String(item.id);
    }
    return String(index);
  };

  const getCellValue = (item: T, column: TableColumn<T>): JSX.Element => {
    if (column.render) {
      return column.render(item);
    }
    const value = item[column.key];
    return <>{value ?? ''}</>;
  };

  const tableClass = (): string => {
    let cls = 'table';
    if (props.zebra) {cls += ' table-zebra';}
    return cls;
  };

  return (
    <div class={`overflow-x-auto ${props.class ?? ''}`} data-testid={props.testId}>
      <table class={tableClass()}>
        <thead>
          <tr>
            <For each={props.columns}>
              {(column) => (
                <th style={column.width ? { width: column.width } : undefined}>
                  {column.label}
                </th>
              )}
            </For>
          </tr>
        </thead>
        <tbody>
          <Show when={props.loading}>
            <tr>
              <td colspan={props.columns.length} class="text-center py-8">
                <span class="loading loading-spinner loading-md"></span>
              </td>
            </tr>
          </Show>
          <Show when={!props.loading && props.data.length === 0}>
            <tr>
              <td colspan={props.columns.length} class="text-center py-8 text-base-content/60">
                {props.emptyMessage ?? 'No data'}
              </td>
            </tr>
          </Show>
          <Show when={!props.loading && props.data.length > 0}>
            <For each={props.data}>
              {(item, index) => (
                <tr class={props.hover ? 'hover' : ''}>
                  <For each={props.columns}>
                    {(column) => (
                      <td>{getCellValue(item, column)}</td>
                    )}
                  </For>
                </tr>
              )}
            </For>
          </Show>
        </tbody>
      </table>
    </div>
  );
}
