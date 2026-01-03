// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { CodingInput } from './CodingInput';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { Coding } from '@medplum/fhirtypes';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('CodingInput', () => {
  test('Renders with placeholder', () => {
    render(() => (
      <TestWrapper>
        <CodingInput
          binding="http://hl7.org/fhir/ValueSet/example"
          placeholder="Select code..."
        />
      </TestWrapper>
    ));
    expect(screen.getByPlaceholderText('Select code...')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => (
      <TestWrapper>
        <CodingInput
          binding="http://hl7.org/fhir/ValueSet/example"
          label="Code"
        />
      </TestWrapper>
    ));
    expect(screen.getByText('Code')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <CodingInput
          binding="http://hl7.org/fhir/ValueSet/example"
          disabled
          testId="coding"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('coding-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('Renders with default value', () => {
    const coding: Coding = {
      system: 'http://example.org',
      code: 'ABC',
      display: 'Test Code',
    };
    render(() => (
      <TestWrapper>
        <CodingInput
          binding="http://hl7.org/fhir/ValueSet/example"
          defaultValue={coding}
          testId="coding"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('coding-input') as HTMLInputElement;
    expect(input.value).toBe('Test Code');
  });
});
