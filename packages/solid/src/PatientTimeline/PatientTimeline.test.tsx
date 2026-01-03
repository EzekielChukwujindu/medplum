// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { PatientTimeline  } from './PatientTimeline';
import type {PatientTimelineProps} from './PatientTimeline';

const medplum = new MockClient();

describe('PatientTimeline', () => {
  function setup(args: PatientTimelineProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <PatientTimeline {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders reference', async () => {
    setup({ patient: createReference(HomerSimpson) });

    await waitFor(() => {
      const items = screen.getAllByTestId('timeline-item');
      expect(items.length).toBeGreaterThan(0);
    });
  });

  test('Renders resource', async () => {
    setup({ patient: HomerSimpson });

    await waitFor(() => {
      const items = screen.getAllByTestId('timeline-item');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
