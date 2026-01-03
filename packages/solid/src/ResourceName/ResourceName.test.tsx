// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ResourceName } from './ResourceName';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { Patient } from '@medplum/fhirtypes';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('ResourceName', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => (
      <TestWrapper>
        <ResourceName />
      </TestWrapper>
    ));
    expect(document.body.textContent?.trim()).toBe('');
  });

  test('Renders resource directly', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['John'], family: 'Doe' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceName value={patient} />
      </TestWrapper>
    ));
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  test('Renders with link', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['Jane'], family: 'Smith' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceName value={patient} link />
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('Jane Smith');
  });

  test('Renders without link by default', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['Bob'], family: 'Jones' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceName value={patient} />
      </TestWrapper>
    ));
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Bob Jones')).toBeTruthy();
  });
});
