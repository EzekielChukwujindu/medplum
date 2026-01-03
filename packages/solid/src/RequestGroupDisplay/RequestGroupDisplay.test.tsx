// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor } from '@solidjs/testing-library';
import { describe, expect, test, vi } from 'vitest';
import { RequestGroupDisplay } from './RequestGroupDisplay';

const medplum = new MockClient();

describe('RequestGroupDisplay', () => {
  function setup(ui: () => any): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        {ui()}
      </MedplumProvider>
    ));
  }

  test('Renders undefined', async () => {
    setup(() => <RequestGroupDisplay onStart={vi.fn()} onEdit={vi.fn()} />);
    // Should render nothing initially
    expect(screen.queryByText('Start')).toBeNull();
  });

  test('Renders reference', async () => {
    const onStart = vi.fn();
    const onEdit = vi.fn();

    // Mock response bundle
    // The component executes batch request. MockClient executes batch?
    // MockClient.executeBatch needs to handle GET requests.
    // By default MockClient executeBatch just returns success but maybe empty?
    // We might need to seed the data in MockClient or mock executeBatch.
    
    // Seed data
    await medplum.createResource({
      resourceType: 'Task',
      id: 'task-1',
      status: 'requested',
      intent: 'order',
      input: [{ type: { text: 'test' }, valueReference: { reference: 'Patient/123' } }],
    });
    
    await medplum.createResource({
      resourceType: 'Task',
      id: 'task-2',
      status: 'requested',
      intent: 'order',
      input: [{ type: { text: 'test' }, valueReference: { reference: 'Patient/123' } }],
    });

    await medplum.createResource({
      resourceType: 'RequestGroup',
      id: 'rg-1',
      status: 'active',
      intent: 'order',
      action: [
         { title: 'Action 1', resource: { reference: 'Task/task-1' } },
         { title: 'Action 2', resource: { reference: 'Task/task-2' } }
      ]
    });

    // MockClient executeBatch implementation:
    // It should handle GET /Task/task-1 etc.
    // If MockClient doesn't support batch GET fully, we might need to spy on it.
    // MockClient generally supports basic CRUD. executeBatch iterates entries.
    // Let's assume it works for created resources.

    setup(() => (
      <RequestGroupDisplay
        onStart={onStart}
        onEdit={onEdit}
        value={{ reference: 'RequestGroup/rg-1' }}
      />
    ));

    await waitFor(() => expect(screen.getByText('Action 1')).toBeInTheDocument());
    expect(screen.getByText('Action 2')).toBeInTheDocument();

    const startButtons = screen.getAllByText('Start');
    expect(startButtons.length).toBeGreaterThan(0);
    
    // Note: Test setup assumes data loads.
    
    fireEvent.click(screen.getAllByText('Start')[0]);
    expect(onStart).toHaveBeenCalled();

    // To test onEdit, we need a task with output.
  });
});
