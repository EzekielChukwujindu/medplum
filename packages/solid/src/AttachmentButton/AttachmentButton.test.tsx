// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi } from 'vitest';
import { AttachmentButton } from './AttachmentButton';
import { MedplumProvider } from '@medplum/solid-hooks';
import { MockClient } from '@medplum/mock';
import type { JSX, ParentProps } from 'solid-js';

function TestWrapper(props: ParentProps): JSX.Element {
  const medplum = new MockClient();
  return (
    <MedplumProvider medplum={medplum}>
      {props.children}
    </MedplumProvider>
  );
}

describe('AttachmentButton', () => {
  test('Renders upload button', () => {
    render(() => (
      <TestWrapper>
        <AttachmentButton onUpload={() => {}}>Upload File</AttachmentButton>
      </TestWrapper>
    ));
    expect(screen.getByTestId('upload-button')).toBeTruthy();
    expect(screen.getByText('Upload File')).toBeTruthy();
  });

  test('Renders hidden file input', () => {
    render(() => (
      <TestWrapper>
        <AttachmentButton onUpload={() => {}}>Upload</AttachmentButton>
      </TestWrapper>
    ));
    const input = screen.getByTestId('upload-file-input') as HTMLInputElement;
    expect(input.type).toBe('file');
    expect(input.style.display).toBe('none');
  });

  test('Renders disabled', () => {
    render(() => (
      <TestWrapper>
        <AttachmentButton onUpload={() => {}} disabled>Upload</AttachmentButton>
      </TestWrapper>
    ));
    const button = screen.getByTestId('upload-button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  test('Clicks file input when button clicked', () => {
    render(() => (
      <TestWrapper>
        <AttachmentButton onUpload={() => {}}>Upload</AttachmentButton>
      </TestWrapper>
    ));
    const input = screen.getByTestId('upload-file-input') as HTMLInputElement;
    const clickSpy = vi.spyOn(input, 'click');
    const button = screen.getByTestId('upload-button');
    fireEvent.click(button);
    expect(clickSpy).toHaveBeenCalled();
  });
});
