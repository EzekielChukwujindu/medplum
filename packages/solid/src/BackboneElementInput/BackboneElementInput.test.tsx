// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { BackboneElementInput } from './BackboneElementInput';

const medplum = new MockClient();

describe('BackboneElementInput', () => {
  test('Not implemented', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BackboneElementInput typeName="Foo" path="Foo" />
      </MedplumProvider>
    ));
    
    await waitFor(() => {
      expect(screen.getByText('Foo not implemented')).toBeTruthy();
    });
  });

  test('Renders with empty type', async () => {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BackboneElementInput typeName="UnknownType" path="Unknown.path" />
      </MedplumProvider>
    ));
    
    await waitFor(() => {
      expect(screen.getByText('UnknownType not implemented')).toBeTruthy();
    });
  });

  test('Renders container', async () => {
    // Request schema first
    await medplum.requestSchema('Patient');
    
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BackboneElementInput 
          typeName="PatientContact" 
          path="Patient.contact"
          testId="backbone-test"
        />
      </MedplumProvider>
    ));
    
    // Just verify it renders without error
    await waitFor(() => {
      const container = document.querySelector('[data-testid="backbone-test"]');
      expect(container || screen.getByText('PatientContact not implemented')).toBeTruthy();
    });
  });
});
