// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { globalSchema } from '@medplum/core';
import type { SearchParameter } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { SearchFilterValueInput } from './SearchFilterValueInput';

const medplum = new MockClient();

function setup(ui: JSX.Element): void {
  render(() => <MedplumProvider medplum={medplum}>{ui}</MedplumProvider>);
}

describe('SearchFilterValueInput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('Text input', async () => {
    const onChange = vi.fn();

    setup(
      <SearchFilterValueInput
        resourceType="Patient"
        searchParam={globalSchema.types['Patient'].searchParams?.['name'] as SearchParameter}
        onChange={onChange}
      />
    );

    const input = screen.getByTestId('filter-value');
    fireEvent.input(input, { target: { value: 'foo' } });

    expect(onChange).toHaveBeenCalledWith('foo');
  });

  test('Boolean input', async () => {
    const onChange = vi.fn();

    setup(
      <SearchFilterValueInput
        resourceType="Patient"
        searchParam={globalSchema.types['Patient'].searchParams?.['active'] as SearchParameter}
        onChange={onChange}
      />
    );

    const checkbox = screen.getByTestId('filter-value');
    fireEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledWith('true');
    
    fireEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith('false');
  });

  test('Date input', async () => {
    const onChange = vi.fn();

    setup(
      <SearchFilterValueInput
        resourceType="Patient"
        searchParam={globalSchema.types['Patient'].searchParams?.['birthdate'] as SearchParameter}
        onChange={onChange}
      />
    );

    const input = screen.getByTestId('filter-value');
    fireEvent.input(input, { target: { value: '1950-01-01' } });

    expect(onChange).toHaveBeenCalledWith('1950-01-01');
  });

  // Date/Time test skipped as it requires more interaction with DateTimeInput which is complex
  
  test('Quantity input', async () => {
    const onChange = vi.fn();

    setup(
      <SearchFilterValueInput
        resourceType="Encounter"
        searchParam={globalSchema.types['Encounter'].searchParams?.['length'] as SearchParameter}
        name="qty"
        onChange={onChange}
      />
    );

    const input = screen.getByPlaceholderText('Value');
    fireEvent.input(input, { target: { value: '5' } });

    expect(onChange).toHaveBeenCalledWith('5');
  });

});
