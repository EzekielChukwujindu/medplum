// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { AllergyIntolerance, Condition, MedicationRequest, Observation, Patient } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { PatientSummary } from './PatientSummary';

const medplum = new MockClient();

const testPatient: Patient = {
  resourceType: 'Patient',
  id: 'test-patient-123',
  name: [{ given: ['John'], family: 'Doe' }],
  birthDate: '1990-01-15',
  gender: 'male',
  address: [
    {
      line: ['123 Main St'],
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
    },
  ],
};

const testAllergy: AllergyIntolerance = {
  resourceType: 'AllergyIntolerance',
  id: 'allergy-1',
  patient: { reference: 'Patient/test-patient-123' },
  code: { text: 'Peanuts' },
};

const testCondition: Condition = {
  resourceType: 'Condition',
  id: 'condition-1',
  subject: { reference: 'Patient/test-patient-123' },
  code: { text: 'Asthma' },
};

const testMedication: MedicationRequest = {
  resourceType: 'MedicationRequest',
  id: 'med-1',
  status: 'active',
  intent: 'order',
  subject: { reference: 'Patient/test-patient-123' },
  medicationCodeableConcept: { text: 'Albuterol' },
};

const testObservation: Observation = {
  resourceType: 'Observation',
  id: 'obs-1',
  status: 'final',
  subject: { reference: 'Patient/test-patient-123' },
  code: { text: 'Blood Pressure' },
  category: [{ coding: [{ code: 'vital-signs' }] }],
  valueQuantity: { value: 120, unit: 'mmHg' },
};

describe('PatientSummary', () => {
  async function setup(patient: Patient = testPatient, onClickResource = vi.fn()): Promise<void> {
    // Seed data
    await medplum.createResource(patient);
    await medplum.createResource(testAllergy);
    await medplum.createResource(testCondition);
    await medplum.createResource(testMedication);
    await medplum.createResource(testObservation);

    render(() => (
      <MedplumProvider medplum={medplum}>
        <PatientSummary patient={patient} onClickResource={onClickResource} />
      </MedplumProvider>
    ));
  }

  test('Renders patient name', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeTruthy();
    });
  });

  test('Renders medical data', async () => {
    await setup();
    await waitFor(() => {
      expect(screen.getByText('Peanuts')).toBeTruthy();
      expect(screen.getByText('Asthma')).toBeTruthy();
      expect(screen.getByText('Albuterol')).toBeTruthy();
      expect(screen.getByText('Blood Pressure')).toBeTruthy();
      expect(screen.getByText('120 mmHg')).toBeTruthy();
    });
  });

  test('Renders section headers', async () => {
    await setup();
    await waitFor(() => {
        expect(screen.getByText('Allergies')).toBeTruthy();
        expect(screen.getByText('Problem List')).toBeTruthy();
        expect(screen.getByText('Medications')).toBeTruthy();
        expect(screen.getByText('Vitals')).toBeTruthy();
    });
  });
});
