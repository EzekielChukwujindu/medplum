// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ReferenceDisplay } from './ReferenceDisplay';
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

describe('ReferenceDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => (
      <TestWrapper>
        <ReferenceDisplay />
      </TestWrapper>
    ));
    expect(document.body.textContent?.trim()).toBe('');
  });

  test('Renders display text as link', () => {
    const ref: Reference = {
      reference: 'Patient/123',
      display: 'John Doe',
    };
    render(() => (
      <TestWrapper>
        <ReferenceDisplay value={ref} />
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.textContent).toBe('John Doe');
  });

  test('Renders reference string when no display', () => {
    const ref: Reference = {
      reference: 'Patient/456',
    };
    render(() => (
      <TestWrapper>
        <ReferenceDisplay value={ref} />
      </TestWrapper>
    ));
    expect(screen.getByText('Patient/456')).toBeTruthy();
  });

  test('Renders without link when link=false', () => {
    const ref: Reference = {
      reference: 'Patient/789',
      display: 'Jane Smith',
    };
    render(() => (
      <TestWrapper>
        <ReferenceDisplay value={ref} link={false} />
      </TestWrapper>
    ));
    expect(screen.getByText('Jane Smith')).toBeTruthy();
    expect(screen.queryByRole('link')).toBeNull();
  });
});
