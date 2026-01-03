// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { WithId } from '@medplum/core';
import type { UserConfiguration } from '@medplum/fhirtypes';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen, waitFor, cleanup } from '@solidjs/testing-library';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { BookmarkDialog } from './BookmarkDialog';

function getTestUserConfiguration(id: string): WithId<UserConfiguration> {
  return {
    id,
    resourceType: 'UserConfiguration',
    menu: [
      {
        title: 'Favorites',
        link: [
          { name: 'Patients', target: '/Patient' },
          { name: 'Active Orders', target: '/ServiceRequest?status=active' },
          { name: 'Completed Orders', target: '/ServiceRequest?status=completed' },
        ],
      },
      {
        title: 'Admin',
        link: [
          { name: 'Project', target: '/admin/project' },
          { name: 'Batch', target: '/batch' },
        ],
      },
    ],
  };
}

describe('BookmarkDialog', () => {
  let medplum: MockClient;

  beforeEach(() => {
    medplum = new MockClient();
    medplum.getUserConfiguration = vi.fn(() => getTestUserConfiguration('test-user-config-id'));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  function setup(visible: boolean, onOk: () => void = vi.fn(), onCancel: () => void = vi.fn()): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <BookmarkDialog
          pathname="/"
          searchParams={new URLSearchParams()}
          visible={visible}
          onOk={onOk}
          onCancel={onCancel}
        />
      </MedplumProvider>
    ));
  }

  test('Render not visible', () => {
    setup(false);
    expect(screen.queryByPlaceholderText('Bookmark Name')).toBeNull();
  });

  test('Render visible', () => {
    setup(true);
    expect(screen.queryByPlaceholderText('Bookmark Name')).not.toBeNull();
  });

  test('Render and Submit', async () => {
    const onOk = vi.fn();
    setup(true, onOk);

    const input = screen.getByPlaceholderText('Bookmark Name') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Test' } });

    const submitButton = screen.getByText('OK');
    fireEvent.click(submitButton);

    await waitFor(() => expect(onOk).toHaveBeenCalled());
  });

  test('Render and Cancel', async () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();
    setup(true, onOk, onCancel);

    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);

    expect(onOk).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalled();
  });

  test('Render and update existing config', async () => {
    const onOk = vi.fn();
    setup(true, onOk);

    const menuInput = screen.getByLabelText(/Select Menu Option/) as HTMLSelectElement;
    const bookmarkInput = screen.getByPlaceholderText('Bookmark Name') as HTMLInputElement;

    // Solid NativeSelect renders a select.
    fireEvent.change(menuInput, { target: { value: 'Admin' } });
    fireEvent.input(bookmarkInput, { target: { value: 'Test' } });

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => expect(onOk).toHaveBeenCalled());
  });

  test('Render and update error for empty id', async () => {
     // Mock error scenario?
     // Medplum updateResource might fail if ID is missing?
     // MockClient updateResource doesn't care much usually.
     // In React test, they return a config with empty ID to force failure in updateResource?
     // Let's mock updateResource to reject.
     const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
     vi.spyOn(medplum, 'updateResource').mockRejectedValue(new Error('Missing id'));
     
     setup(true);

     const bookmarkInput = screen.getByPlaceholderText('Bookmark Name') as HTMLInputElement;
     fireEvent.input(bookmarkInput, { target: { value: 'Test' } });
     fireEvent.click(screen.getByText('OK'));

     await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Missing id'));
     errorSpy.mockRestore();
  });
});
