// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Identifier, Patient } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { PatientHeader } from './PatientHeader';

const medplum = new MockClient();

describe('PatientHeader', () => {
  function setup(patient: Patient): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <PatientHeader patient={patient} />
      </MedplumProvider>
    ));
  }

  test('Renders', async () => {
    setup({
      resourceType: 'Patient',
      name: [
        {
          given: ['Alice'],
          family: 'Smith',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeTruthy();
    });
  });

  test('Renders identifiers', async () => {
    setup({
      resourceType: 'Patient',
      name: [
        {
          given: ['Alice'],
          family: 'Smith',
        },
      ],
      identifier: [
        { system: 'abc', value: '123' },
        { system: 'def', value: '456' },
      ],
      address: [
        {
          state: 'NY',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByText('abc')).toBeTruthy();
      expect(screen.getByText('123')).toBeTruthy();
      expect(screen.getByText('def')).toBeTruthy();
      expect(screen.getByText('456')).toBeTruthy();
      expect(screen.getByText('NY')).toBeTruthy();
    });
  });

  test('Handles null identifiers', async () => {
    setup({
      resourceType: 'Patient',
      name: [
        {
          given: ['Alice'],
          family: 'Smith',
        },
      ],
      identifier: [
        null,
        { system: 'system-with-null-value', value: null },
        { system: null, value: 'value-with-null-system' },
        { system: 'def', value: '456' },
      ] as unknown as Identifier[],
    });

    await waitFor(() => {
      expect(screen.getByText('system-with-null-value')).toBeTruthy();
      expect(screen.getByText('value-with-null-system')).toBeTruthy();
      expect(screen.getByText('def')).toBeTruthy();
      expect(screen.getByText('456')).toBeTruthy();
    });
  });

  test('Age in years day after birthday', async () => {
    const birthDate = new Date();
    birthDate.setUTCHours(0, 0, 0, 0);
    birthDate.setUTCFullYear(birthDate.getUTCFullYear() - 30);
    birthDate.setUTCDate(birthDate.getUTCDate() - 1);

    setup({
      resourceType: 'Patient',
      name: [
        {
          given: ['Unknown'],
          family: 'Smith',
        },
      ],
      birthDate: birthDate.toISOString().substring(0, 10),
    });

    await waitFor(() => {
      expect(screen.getByText('030Y')).toBeTruthy();
    });
  });

  test('Age in years day before birthday', async () => {
    const birthDate = new Date();
    birthDate.setUTCHours(0, 0, 0, 0);
    birthDate.setUTCFullYear(birthDate.getUTCFullYear() - 30);
    birthDate.setUTCDate(birthDate.getUTCDate() + 1);

    setup({
      resourceType: 'Patient',
      name: [
        {
          given: ['Unknown'],
          family: 'Smith',
        },
      ],
      birthDate: birthDate.toISOString().substring(0, 10),
    });

    await waitFor(() => {
      expect(screen.getByText('029Y')).toBeTruthy();
    });
  });

  test('Handles blank name', async () => {
    setup({
      resourceType: 'Patient',
    });

    await waitFor(() => {
      expect(screen.getByText('[blank]')).toBeTruthy();
    });
  });
});
