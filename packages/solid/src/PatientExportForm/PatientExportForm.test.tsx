// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { allOk } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi, beforeAll } from 'vitest';
import type { PatientExportFormProps } from './PatientExportForm';
import { PatientExportForm } from './PatientExportForm';

describe('PatientExportForm', () => {
  async function setup(args: PatientExportFormProps, medplum = new MockClient()): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <PatientExportForm {...args} />
      </MedplumProvider>
    ));
  }

  beforeAll(() => {
    // Mock URL.createObjectURL
    URL.createObjectURL = vi.fn();
    URL.revokeObjectURL = vi.fn();

    // Mock document.createElement for anchor download
    type MyDocument = typeof document & {
      originalCreateElement: (tagName: string, options?: ElementCreationOptions) => any;
    };

    // Save the original createElement function
    (document as MyDocument).originalCreateElement = document.createElement.bind(document);

    // Create a wrapper function
    document.createElement = ((tagName: string, options?: ElementCreationOptions): any => {
      const result = (document as MyDocument).originalCreateElement(tagName, options);
      if (tagName === 'a') {
        result.click = vi.fn();
      }
      return result;
    }) as typeof document.createElement;
  });

  test('Renders', async () => {
    await setup({ patient: HomerSimpson });

    await waitFor(() => {
      const button = screen.getByText('Request Export');
      expect(button).toBeDefined();
    });
  });

  test('Submit', async () => {
    // Mock the patient everything endpoint
    const medplum = new MockClient();
    medplum.router.add('POST', '/Patient/:id/$everything', async () => [
      allOk,
      { resourceType: 'Bundle', type: 'document' },
    ]);

    await setup({ patient: HomerSimpson }, medplum);

    await waitFor(() => {
      const button = screen.getByText('Request Export');
      expect(button).toBeDefined();
    });

    fireEvent.click(screen.getByText('Request Export'));

    await waitFor(() => {
      expect(screen.getByText('Patient Export')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeDefined();
    });
  });

  test('Submit with start and end', async () => {
    // Mock the patient everything endpoint
    const medplum = new MockClient();
    medplum.router.add('POST', '/Patient/:id/$everything', async () => [
      allOk,
      { resourceType: 'Bundle', type: 'document' },
    ]);

    await setup({ patient: HomerSimpson }, medplum);

    fireEvent.input(screen.getByPlaceholderText('Start date'), { target: { value: '2020-01-01T00:00:00' } });
    fireEvent.input(screen.getByPlaceholderText('End date'), { target: { value: '2040-01-01T00:00:00' } });

    await waitFor(() => {
      const button = screen.getByText('Request Export');
      expect(button).toBeDefined();
    });

    fireEvent.click(screen.getByText('Request Export'));

    await waitFor(() => {
      expect(screen.getByText('Patient Export')).toBeDefined();
    });

    await waitFor(() => {
      expect(screen.getByText('Done')).toBeDefined();
    });
  });
});
