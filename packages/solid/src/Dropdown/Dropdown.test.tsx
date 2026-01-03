// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { Dropdown  } from './Dropdown';
import type {DropdownItem} from './Dropdown';

describe('Dropdown', () => {
  const items: DropdownItem[] = [
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'disabled', label: 'Disabled', disabled: true },
  ];

  test('Renders trigger button', () => {
    render(() => <Dropdown label="Actions" items={items} testId="dropdown" />);
    expect(screen.getByText('Actions')).toBeTruthy();
  });

  test('Renders all menu items', () => {
    render(() => <Dropdown label="Actions" items={items} testId="dropdown" />);
    expect(screen.getByText('Edit')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();
    expect(screen.getByText('Disabled')).toBeTruthy();
  });

  test('Calls onSelect when item clicked', () => {
    const handleSelect = vi.fn();
    render(() => (
      <Dropdown label="Actions" items={items} onSelect={handleSelect} testId="dropdown" />
    ));
    fireEvent.click(screen.getByTestId('dropdown-item-edit'));
    expect(handleSelect).toHaveBeenCalledWith('edit');
  });

  test('Does not call onSelect for disabled items', () => {
    const handleSelect = vi.fn();
    render(() => (
      <Dropdown label="Actions" items={items} onSelect={handleSelect} testId="dropdown" />
    ));
    fireEvent.click(screen.getByTestId('dropdown-item-disabled'));
    expect(handleSelect).not.toHaveBeenCalled();
  });

  test('Renders with custom trigger', () => {
    render(() => (
      <Dropdown
        label={<span data-testid="custom">Custom Trigger</span>}
        items={items}
        testId="dropdown"
      />
    ));
    expect(screen.getByTestId('custom')).toBeTruthy();
  });
});
