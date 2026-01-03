// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { PropertyType } from '@medplum/core';
import type { Patient } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import { FhirPathDisplay } from './FhirPathDisplay';

describe('FhirPathDisplay', () => {
  beforeAll(async () => {
    await new MockClient().requestSchema('Patient');
  });

  test('Renders single value', async () => {
    const patient: Patient = {
      resourceType: 'Patient',
      name: [
        {
          given: ['Alice'],
          family: 'Smith',
        },
      ],
    };

    render(() => <FhirPathDisplay resource={patient} path="Patient.name.given" propertyType={PropertyType.string} />);
    
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeTruthy();
    });
  });

  test('Error on multiple values', () => {
    const patient: Patient = {
      resourceType: 'Patient',
      name: [
        {
          given: ['Alice', 'Ann'],
          family: 'Smith',
        },
      ],
    };
    
    expect(() =>
      render(() => <FhirPathDisplay resource={patient} path="Patient.name.given" propertyType={PropertyType.string} />)
    ).toThrow('must resolve to a single element');
  });

  test('Handles null name', () => {
    const { container } = render(() => (
      <FhirPathDisplay
        resource={{
          resourceType: 'Patient',
        }}
        path="Patient.name.given"
        propertyType={PropertyType.string}
      />
    ));
    expect(container).toBeTruthy();
  });

  test('Handles malformed date', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    render(() => (
      <FhirPathDisplay
        resource={{
          resourceType: 'Patient',
          birthDate: 'not a date',
        }}
        path="between(birthDate, now(), 'years')"
        propertyType={PropertyType.string}
      />
    ));
    
    expect(consoleWarn).toHaveBeenCalledWith('FhirPathDisplay:', expect.any(Error));
    consoleWarn.mockRestore();
  });
});
