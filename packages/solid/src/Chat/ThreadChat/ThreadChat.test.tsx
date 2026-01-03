// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference } from '@medplum/core';
import type { Communication, Patient, Practitioner } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { cleanup, fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type { JSX } from 'solid-js';
import { ThreadChat } from './ThreadChat';

const medplum = new MockClient();

const practitioner: Practitioner = {
  resourceType: 'Practitioner',
  id: '123',
  name: [{ given: ['Alice'], family: 'Smith' }],
};

const patient: Patient = {
  resourceType: 'Patient',
  id: '456',
  name: [{ given: ['Bob'], family: 'Jones' }],
};

const thread: Communication = {
  resourceType: 'Communication',
  id: '789',
  status: 'completed',
  sender: createReference(patient),
  recipient: [createReference(practitioner)],
  topic: { text: 'Test Thread' },
};

function setup(ui: () => JSX.Element): void {
  render(() => <MedplumProvider medplum={medplum}>{ui()}</MedplumProvider>);
}

describe('ThreadChat', () => {
  beforeEach(() => {
    vi.spyOn(medplum, 'getProfile').mockReturnValue(practitioner);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('Renders', async () => {
    setup(() => <ThreadChat thread={thread} />);
    await waitFor(() => expect(screen.getByText('Test Thread')).toBeInTheDocument());
  });

  test('Send message', async () => {
    setup(() => <ThreadChat thread={thread} />);
    await waitFor(() => expect(screen.getByText('Test Thread')).toBeInTheDocument());

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.input(input, { target: { value: 'Hello world' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => expect(screen.getByText('Hello world')).toBeInTheDocument());
  });

  // Additional tests can be added for multi-recipient logic etc.
});
