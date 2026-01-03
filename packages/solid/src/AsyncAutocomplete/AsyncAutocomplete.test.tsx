// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { AsyncAutocomplete } from './AsyncAutocomplete';

interface TestItem {
  id: string;
  name: string;
}

const mockItems: TestItem[] = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Banana' },
  { id: '3', name: 'Cherry' },
];

const toOption = (item: TestItem) => ({
  value: item.id,
  label: item.name,
  resource: item,
});

describe('AsyncAutocomplete', () => {
  test('Renders with placeholder', () => {
    render(() => (
      <AsyncAutocomplete
        placeholder="Search..."
        toOption={toOption}
        loadOptions={async () => []}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    expect(screen.getByPlaceholderText('Search...')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => (
      <AsyncAutocomplete
        label="Select Item"
        toOption={toOption}
        loadOptions={async () => []}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    expect(screen.getByText('Select Item')).toBeTruthy();
  });

  test('Shows required asterisk', () => {
    render(() => (
      <AsyncAutocomplete
        label="Required Field"
        required
        toOption={toOption}
        loadOptions={async () => []}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Shows error message', () => {
    render(() => (
      <AsyncAutocomplete
        error="Selection required"
        toOption={toOption}
        loadOptions={async () => []}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    expect(screen.getByText('Selection required')).toBeTruthy();
  });

  test('Calls loadOptions on input', async () => {
    const loadOptions = vi.fn().mockResolvedValue(mockItems);
    render(() => (
      <AsyncAutocomplete
        toOption={toOption}
        loadOptions={loadOptions}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    const input = screen.getByTestId('autocomplete-input');
    fireEvent.input(input, { target: { value: 'app' } });
    await waitFor(() => expect(loadOptions).toHaveBeenCalled());
  });

  test('Renders disabled', () => {
    render(() => (
      <AsyncAutocomplete
        disabled
        toOption={toOption}
        loadOptions={async () => []}
        onChange={() => {}}
        testId="autocomplete"
      />
    ));
    const input = screen.getByTestId('autocomplete-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
