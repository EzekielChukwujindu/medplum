// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ValueSetAutocomplete } from './ValueSetAutocomplete';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('ValueSetAutocomplete', () => {
  test('Renders with placeholder', () => {
    render(() => (
      <TestWrapper>
        <ValueSetAutocomplete
          binding="http://hl7.org/fhir/ValueSet/example"
          placeholder="Search codes..."
          onChange={() => {}}
          testId="valueset-autocomplete"
        />
      </TestWrapper>
    ));
    expect(screen.getByPlaceholderText('Search codes...')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => (
      <TestWrapper>
        <ValueSetAutocomplete
          binding="http://hl7.org/fhir/ValueSet/example"
          label="Select Code"
          onChange={() => {}}
          testId="valueset-autocomplete"
        />
      </TestWrapper>
    ));
    expect(screen.getByText('Select Code')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <ValueSetAutocomplete
          binding="http://hl7.org/fhir/ValueSet/example"
          disabled
          onChange={() => {}}
          testId="valueset-autocomplete"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('valueset-autocomplete-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
