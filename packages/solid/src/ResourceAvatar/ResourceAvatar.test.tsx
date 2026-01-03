// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ResourceAvatar } from './ResourceAvatar';
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

describe('ResourceAvatar', () => {
  test('Renders avatar with initials', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['John'], family: 'Doe' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceAvatar value={patient} />
      </TestWrapper>
    ));
    expect(screen.getByText('JD')).toBeTruthy();
  });

  test('Renders avatar placeholder class', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['Jane'], family: 'Smith' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceAvatar value={patient} />
      </TestWrapper>
    ));
    expect(document.querySelector('.avatar')).toBeTruthy();
  });

  test('Renders avatar with link', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['Bob'], family: 'Jones' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceAvatar value={patient} link />
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link).toBeTruthy();
  });
});
