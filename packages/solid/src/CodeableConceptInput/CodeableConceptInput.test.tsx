// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { CodeableConceptInput } from './CodeableConceptInput';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { CodeableConcept } from '@medplum/fhirtypes';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('CodeableConceptInput', () => {
  test('Renders with placeholder', () => {
    render(() => (
      <TestWrapper>
        <CodeableConceptInput
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
        <CodeableConceptInput
          binding="http://hl7.org/fhir/ValueSet/example"
          label="Condition Code"
        />
      </TestWrapper>
    ));
    expect(screen.getByText('Condition Code')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <CodeableConceptInput
          binding="http://hl7.org/fhir/ValueSet/example"
          disabled
          testId="cc"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('cc-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('Renders with default value', () => {
    const cc: CodeableConcept = {
      coding: [{
        system: 'http://example.org',
        code: 'TEST',
        display: 'Test Concept',
      }],
    };
    render(() => (
      <TestWrapper>
        <CodeableConceptInput
          binding="http://hl7.org/fhir/ValueSet/example"
          defaultValue={cc}
          testId="cc"
        />
      </TestWrapper>
    ));
    // In multi-select mode, value shows as badge
    expect(screen.getByText('Test Concept')).toBeTruthy();
  });
});
