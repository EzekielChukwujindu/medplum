// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import { ExampleSubscription, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import type { DefaultResourceTimelineProps } from './DefaultResourceTimeline';
import { DefaultResourceTimeline } from './DefaultResourceTimeline';

const medplum = new MockClient();

describe('DefaultResourceTimeline', () => {
  async function setup(args: DefaultResourceTimelineProps): Promise<void> {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <DefaultResourceTimeline {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders reference', async () => {
    await setup({ resource: createReference(ExampleSubscription) });

    // Wait for the timeline to load
    await waitFor(() => {
      // Check for timeline items or the form
      expect(
        screen.queryAllByTestId('timeline-item').length > 0 ||
        screen.queryByText('Created') ||
        screen.queryByTestId('timeline-form')
      ).toBeTruthy();
    });
  });

  test('Renders resource', async () => {
    await setup({ resource: ExampleSubscription });

    await waitFor(() => {
      expect(
        screen.queryAllByTestId('timeline-item').length > 0 ||
        screen.queryByText('Created') ||
        screen.queryByTestId('timeline-form')
      ).toBeTruthy();
    });
  });

  test('Renders component', async () => {
    await setup({ resource: ExampleSubscription });

    // Just verify the component renders without error
    await waitFor(() => {
      expect(document.body.textContent).toBeTruthy();
    });
  });
});
