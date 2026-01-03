// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { AttachmentInput } from './AttachmentInput';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { Attachment } from '@medplum/fhirtypes';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('AttachmentInput', () => {
  test('Renders upload button when empty', () => {
    render(() => (
      <TestWrapper>
        <AttachmentInput />
      </TestWrapper>
    ));
    expect(screen.getByTestId('upload-button')).toBeTruthy();
    expect(screen.getByText('Upload...')).toBeTruthy();
  });

  test('Renders attachment display when has value', () => {
    const attachment: Attachment = {
      contentType: 'image/png',
      url: 'https://example.com/image.png',
      title: 'test.png',
    };
    render(() => (
      <TestWrapper>
        <AttachmentInput defaultValue={attachment} />
      </TestWrapper>
    ));
    expect(screen.getByTestId('attachment-display')).toBeTruthy();
    expect(screen.getByTestId('remove-attachment')).toBeTruthy();
  });

  test('Removes attachment when remove clicked', () => {
    const handleChange = vi.fn();
    const attachment: Attachment = {
      contentType: 'image/png',
      url: 'https://example.com/image.png',
      title: 'test.png',
    };
    render(() => (
      <TestWrapper>
        <AttachmentInput defaultValue={attachment} onChange={handleChange} />
      </TestWrapper>
    ));
    const removeButton = screen.getByTestId('remove-attachment');
    fireEvent.click(removeButton);
    expect(handleChange).toHaveBeenCalledWith(undefined);
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <AttachmentInput disabled />
      </TestWrapper>
    ));
    const button = screen.getByTestId('upload-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
