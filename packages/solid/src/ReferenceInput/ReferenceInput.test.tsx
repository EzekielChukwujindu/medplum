// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ReferenceInput } from './ReferenceInput';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { Reference } from '@medplum/fhirtypes';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('ReferenceInput', () => {
  test('Renders with label', () => {
    render(() => (
      <TestWrapper>
        <ReferenceInput
          label="Patient Reference"
          targetTypes={['Patient']}
          testId="ref"
        />
      </TestWrapper>
    ));
    expect(screen.getByText('Patient Reference')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <ReferenceInput
          targetTypes={['Patient']}
          disabled
          testId="ref"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('ref-resource-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('Shows type selector with multiple types', () => {
    render(() => (
      <TestWrapper>
        <ReferenceInput
          targetTypes={['Patient', 'Practitioner']}
          testId="ref"
        />
      </TestWrapper>
    ));
    expect(screen.getByTestId('ref-type')).toBeTruthy();
  });

  test('Hides type selector with single type', () => {
    render(() => (
      <TestWrapper>
        <ReferenceInput
          targetTypes={['Patient']}
          testId="ref"
        />
      </TestWrapper>
    ));
    expect(screen.queryByTestId('ref-type')).toBeNull();
  });

  test('Renders with default value', () => {
    const ref: Reference = {
      reference: 'Patient/123',
      display: 'John Doe',
    };
    render(() => (
      <TestWrapper>
        <ReferenceInput
          defaultValue={ref}
          targetTypes={['Patient']}
          testId="ref"
        />
      </TestWrapper>
    ));
    // Input should render
    expect(screen.getByTestId('ref-resource-input')).toBeTruthy();
  });
});
