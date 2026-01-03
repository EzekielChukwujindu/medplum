// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { DiagnosticReport } from '@medplum/fhirtypes';
import { HomerDiagnosticReport, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { DiagnosticReportDisplayProps } from './DiagnosticReportDisplay';
import { DiagnosticReportDisplay } from './DiagnosticReportDisplay';

const medplum = new MockClient();

describe('DiagnosticReportDisplay', () => {
  function setup(args: DiagnosticReportDisplayProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <DiagnosticReportDisplay {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders by value', async () => {
    setup({ value: HomerDiagnosticReport });

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Report')).toBeTruthy();
    });
  });

  test('Renders by reference', async () => {
    setup({ value: { reference: 'DiagnosticReport/123' } });

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Report')).toBeTruthy();
    });
  });

  test('No specimen header if no specimen', async () => {
    setup({ value: { resourceType: 'DiagnosticReport' } as DiagnosticReport });

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Report')).toBeTruthy();
    });

    expect(screen.queryByText('Specimen')).toBeNull();
  });

  test('Renders with hideSubject', async () => {
    setup({ value: HomerDiagnosticReport, hideSubject: true });

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Report')).toBeTruthy();
    });

    // Subject should be hidden
    expect(screen.queryByText('Homer Simpson')).toBeNull();
  });

  test('Renders with hideSpecimenInfo', async () => {
    setup({ value: HomerDiagnosticReport, hideSpecimenInfo: true });

    await waitFor(() => {
      expect(screen.getByText('Diagnostic Report')).toBeTruthy();
    });

    expect(screen.queryByText('Collected:')).toBeNull();
  });
});
