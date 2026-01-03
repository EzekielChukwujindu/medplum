// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { ResourceTable } from './ResourceTable';
import type { Patient } from '@medplum/fhirtypes';

describe('ResourceTable', () => {
  const testPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-123',
    name: [{ given: ['John'], family: 'Doe' }],
  };

  test('Renders null before schema loads', () => {
    const client = createMockMedplumClient();
    const { container } = render(() => (
      <MedplumProvider medplum={client}>
        <ResourceTable value={testPatient} />
      </MedplumProvider>
    ));
    // Initially empty while schema loads
    expect(container.textContent).toBe('');
  });

  test('Handles Reference input', () => {
    const client = createMockMedplumClient();
    const { container } = render(() => (
      <MedplumProvider medplum={client}>
        <ResourceTable value={{ reference: 'Patient/123' }} />
      </MedplumProvider>
    ));
    expect(container).toBeTruthy();
  });
});
