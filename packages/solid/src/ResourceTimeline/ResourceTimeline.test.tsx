
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { Attachment, Bundle, Encounter, Media, Resource } from '@medplum/fhirtypes';
import type { ProfileResource } from '@medplum/core';
import { createReference } from '@medplum/core';
import { HomerEncounter, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import type { ResourceTimelineProps } from './ResourceTimeline';
import { ResourceTimeline } from './ResourceTimeline';

const medplum = new MockClient();

async function loadTimelineResources(): Promise<PromiseSettledResult<Bundle>[]> {
  return Promise.allSettled([
    medplum.readHistory('Encounter', HomerEncounter.id!),
    medplum.search('Communication', 'encounter=Encounter/' + HomerEncounter.id!),
    medplum.search('Media', 'encounter=Encounter/' + HomerEncounter.id!),
  ]);
}

describe('ResourceTimeline', () => {
  function setup<T extends Resource>(args: ResourceTimelineProps<T>): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <ResourceTimeline {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders reference', async () => {
    setup({
      value: createReference(HomerEncounter),
      loadTimelineResources,
    });

    await waitFor(() => expect(screen.getAllByTestId('timeline-item')).toBeDefined());
    expect(screen.getAllByTestId('timeline-item').length).toBeGreaterThan(0);
  });

  test('Renders resource', async () => {
    // Ensure the resource exists in mock client
    await medplum.createResource(HomerEncounter);

    setup({
      value: HomerEncounter,
      loadTimelineResources,
    });

    await waitFor(() => expect(screen.getAllByTestId('timeline-item')).toBeDefined());
  });

  test('Create comment', async () => {
    await medplum.createResource(HomerEncounter);

    setup({
      value: HomerEncounter,
      loadTimelineResources,
      createCommunication: (resource: any, sender: any, text: string) => ({
        resourceType: 'Communication',
        status: 'completed',
        encounter: createReference(resource),
        subject: resource.subject,
        sender: createReference(sender),
        payload: [{ contentString: text }],
      }),
    });

    await waitFor(() => expect(screen.getAllByTestId('timeline-item')).toBeDefined());

    const input = screen.getByPlaceholderText('Add comment');
    fireEvent.input(input, { target: { value: 'Test comment' } });

    // Find submit button (btn-primary inside form)
    const form = screen.getByTestId('timeline-form');
    fireEvent.submit(form);

    await waitFor(() => {
       expect(screen.getByText('Test comment')).toBeDefined();
    });
  });

  test('Upload media', async () => {
    await medplum.createResource(HomerEncounter);
    
    // Mock URL.createObjectURL for JSDOM
    global.URL.createObjectURL = vi.fn(() => 'blob:http://localhost/blob');

    const createMediaSpy = vi.fn((resource: any, operator: any, content: any) => ({
        resourceType: 'Media',
        status: 'completed',
        encounter: createReference(resource),
        content,
    }));

    setup({
      value: HomerEncounter,
      loadTimelineResources,
      createCommunication: vi.fn(),
      createMedia: createMediaSpy as unknown as (resource: Encounter, operator: ProfileResource, attachment: Attachment) => Media,
    });

    await waitFor(() => expect(screen.getAllByTestId('timeline-item')).toBeDefined());

    const file = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const input = screen.getByTestId('upload-file-input');
    
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
        expect(createMediaSpy).toHaveBeenCalled();
        expect(screen.getByText('Upload complete')).toBeDefined();
    });
  });
});
