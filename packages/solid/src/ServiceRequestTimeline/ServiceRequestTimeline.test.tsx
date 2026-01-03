// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import { HomerSimpson, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { ServiceRequestTimeline } from './ServiceRequestTimeline';
import type { ServiceRequest } from '@medplum/fhirtypes';

const medplum = new MockClient();

const serviceRequest: ServiceRequest = {
  resourceType: 'ServiceRequest',
  id: '123',
  status: 'active',
  intent: 'order',
  subject: createReference(HomerSimpson),
};

describe('ServiceRequestTimeline', () => {
  function setup(request: ServiceRequest): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ServiceRequestTimeline serviceRequest={request} />
      </MedplumProvider>
    ));
  }

  test('Renders resource', async () => {
    setup(serviceRequest);

    await waitFor(() => {
      // ResourceTimeline renders "Timeline" or items
      // We expect at least the container or items if loaded.
      // MockClient doesn't return related items by default unless setup.
      // But ResourceTimeline usually displays something.
      // Let's check for testid 'timeline' if it exists or just check successful render of children.
      const items = screen.getAllByTestId('timeline-item');
      expect(items.length).toBeGreaterThan(0);
    });
  });
});
