// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ResourceInput } from './ResourceInput';
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

describe('ResourceInput', () => {
  test('Renders with placeholder', () => {
    render(() => (
      <TestWrapper>
        <ResourceInput
          resourceType="Patient"
          placeholder="Search patients..."
        />
      </TestWrapper>
    ));
    expect(screen.getByPlaceholderText('Search patients...')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => (
      <TestWrapper>
        <ResourceInput
          resourceType="Patient"
          label="Select Patient"
        />
      </TestWrapper>
    ));
    expect(screen.getByText('Select Patient')).toBeTruthy();
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <ResourceInput
          resourceType="Patient"
          disabled
          testId="patient"
        />
      </TestWrapper>
    ));
    const input = screen.getByTestId('patient-input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  test('Renders with default placeholder', () => {
    render(() => (
      <TestWrapper>
        <ResourceInput
          resourceType="Practitioner"
          testId="prac"
        />
      </TestWrapper>
    ));
    expect(screen.getByPlaceholderText('Search Practitioner...')).toBeTruthy();
  });
});
