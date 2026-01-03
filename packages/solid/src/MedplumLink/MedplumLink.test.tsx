// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MedplumLink } from './MedplumLink';
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

describe('MedplumLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Renders children', () => {
    render(() => (
      <TestWrapper>
        <MedplumLink to="/test">Click me</MedplumLink>
      </TestWrapper>
    ));
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  test('Renders with string href', () => {
    render(() => (
      <TestWrapper>
        <MedplumLink to="/Patient/123">Patient</MedplumLink>
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/Patient/123');
  });

  test('Renders with Resource', () => {
    const patient = { resourceType: 'Patient' as const, id: '456' };
    render(() => (
      <TestWrapper>
        <MedplumLink to={patient}>Patient</MedplumLink>
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/Patient/456');
  });

  test('Renders with Reference', () => {
    const ref = { reference: 'Patient/789' };
    render(() => (
      <TestWrapper>
        <MedplumLink to={ref}>Patient</MedplumLink>
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/Patient/789');
  });

  test('Applies suffix', () => {
    render(() => (
      <TestWrapper>
        <MedplumLink to="/Patient/123" suffix="edit">Edit</MedplumLink>
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/Patient/123/edit');
  });

  test('Has aria-label', () => {
    render(() => (
      <TestWrapper>
        <MedplumLink to="/test" label="Test link">Click</MedplumLink>
      </TestWrapper>
    ));
    const link = screen.getByRole('link');
    expect(link.getAttribute('aria-label')).toBe('Test link');
  });
});
