// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ResourceBadge } from './ResourceBadge';
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

describe('ResourceBadge', () => {
  test('Renders avatar and name', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['John'], family: 'Doe' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceBadge value={patient} />
      </TestWrapper>
    ));
    // Should have avatar with initials
    expect(screen.getByText('JD')).toBeTruthy();
    // Should have name
    expect(screen.getByText('John Doe')).toBeTruthy();
  });

  test('Renders with links', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['Jane'], family: 'Smith' }],
    };
    render(() => (
      <TestWrapper>
        <ResourceBadge value={patient} link />
      </TestWrapper>
    ));
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
