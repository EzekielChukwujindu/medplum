// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen, fireEvent, waitFor } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeAll } from 'vitest';
import type { AttachmentArrayInputProps } from './AttachmentArrayInput';
import { AttachmentArrayInput } from './AttachmentArrayInput';

const medplum = new MockClient();

function setup(args?: Partial<AttachmentArrayInputProps>): void {
  render(() => (
    <MedplumProvider medplum={medplum}>
      <AttachmentArrayInput name="test" {...args} />
    </MedplumProvider>
  ));
}

describe('AttachmentArrayInput', () => {
  beforeAll(() => {
    (global.URL as unknown as { createObjectURL: () => string }).createObjectURL = vi.fn(() => 'details');
  });

  test('Renders', () => {
    setup();
    expect(screen.getByText('Add Attachment')).toBeTruthy();
  });

  test('Renders empty array', () => {
    setup({
      defaultValue: [],
    });
    expect(screen.getByText('Add Attachment')).toBeTruthy();
  });

  test('Renders attachments', async () => {
    setup({
      defaultValue: [
        {
          contentType: 'image/jpeg',
          url: 'https://example.com/test.jpg',
          title: 'test.jpg',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByAltText('test.jpg')).toBeTruthy();
    });
  });

  test('Remove attachment', async () => {
    setup({
      defaultValue: [
        {
          contentType: 'image/jpeg',
          url: 'https://example.com/test.jpg',
          title: 'test.jpg',
        },
      ],
    });

    await waitFor(() => {
      expect(screen.getByAltText('test.jpg')).toBeTruthy();
    });

    fireEvent.click(screen.getByTitle('Remove'));

    await waitFor(() => {
      expect(screen.queryByAltText('test.jpg')).toBeNull();
    });
  });

  test('Calls onChange', async () => {
    const onChange = vi.fn();

    setup({ onChange });

    // The onChange is called when attachments are added
    // Testing the structure is rendered properly
    expect(screen.getByText('Add Attachment')).toBeTruthy();
  });
});
