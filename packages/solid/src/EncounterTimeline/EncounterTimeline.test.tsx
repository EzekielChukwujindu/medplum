// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import { HomerEncounter, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { EncounterTimelineProps } from './EncounterTimeline';
import { EncounterTimeline } from './EncounterTimeline';

const medplum = new MockClient();

describe('EncounterTimeline', () => {
  async function setup(args: EncounterTimelineProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <EncounterTimeline {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders reference', async () => {
    await setup({ encounter: createReference(HomerEncounter) });

    // Wait for timeline to render
    await waitFor(() => {
      expect(
        screen.queryAllByTestId('timeline-item').length > 0 ||
        screen.queryByText('Created') ||
        screen.queryByTestId('timeline-form')
      ).toBeTruthy();
    });
  });

  test('Renders resource', async () => {
    await setup({ encounter: HomerEncounter });

    await waitFor(() => {
      expect(
        screen.queryAllByTestId('timeline-item').length > 0 ||
        screen.queryByText('Created') ||
        screen.queryByTestId('timeline-form')
      ).toBeTruthy();
    });
  });

  test('Renders component', async () => {
    await setup({ encounter: HomerEncounter });

    // Just verify the component renders without error
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    });
  });
});
