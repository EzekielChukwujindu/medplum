// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { MedplumProvider, createMockMedplumClient } from '../test-utils/render';
import { BackboneElementDisplay } from './BackboneElementDisplay';

describe('BackboneElementDisplay', () => {
  test('Renders null for empty value', () => {
    const client = createMockMedplumClient();
    const { container } = render(() => (
      <MedplumProvider medplum={client}>
        <BackboneElementDisplay
          path="Patient.contact"
          value={{ type: 'PatientContact', value: undefined }}
        />
      </MedplumProvider>
    ));
    expect(container.textContent).toBe('');
  });

  test('Shows not implemented for unknown type', () => {
    const client = createMockMedplumClient();
    render(() => (
      <MedplumProvider medplum={client}>
        <BackboneElementDisplay
          path="Unknown"
          value={{ type: 'UnknownType', value: { foo: 'bar' } }}
        />
      </MedplumProvider>
    ));
    expect(screen.getByText(/not implemented/)).toBeTruthy();
  });

  test('Renders component without error', () => {
    const client = createMockMedplumClient();
    const { container } = render(() => (
      <MedplumProvider medplum={client}>
        <BackboneElementDisplay
          path="Test"
          value={{ type: 'Address', value: { city: 'Boston' } }}
        />
      </MedplumProvider>
    ));
    // Just verify it renders without throwing
    expect(container).toBeTruthy();
  });
});
