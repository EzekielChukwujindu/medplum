// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { AttachmentDisplay } from './AttachmentDisplay';
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

describe('AttachmentDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => (
      <TestWrapper>
        <AttachmentDisplay />
      </TestWrapper>
    ));
    expect(screen.queryByTestId('attachment-display')).toBeNull();
  });

  test('Renders nothing when url is undefined', () => {
    const attachment: Attachment = {
      contentType: 'image/png',
    };
    render(() => (
      <TestWrapper>
        <AttachmentDisplay value={attachment} />
      </TestWrapper>
    ));
    expect(screen.queryByTestId('attachment-display')).toBeNull();
  });

  test('Renders image attachment', () => {
    const attachment: Attachment = {
      contentType: 'image/png',
      url: 'https://example.com/image.png',
      title: 'Test Image',
    };
    render(() => (
      <TestWrapper>
        <AttachmentDisplay value={attachment} />
      </TestWrapper>
    ));
    expect(screen.getByTestId('attachment-image')).toBeTruthy();
  });

  test('Renders download link', () => {
    const attachment: Attachment = {
      contentType: 'image/png',
      url: 'https://example.com/image.png',
      title: 'photo.png',
    };
    render(() => (
      <TestWrapper>
        <AttachmentDisplay value={attachment} />
      </TestWrapper>
    ));
    const link = screen.getByTestId('attachment-details');
    expect(link.textContent).toBe('photo.png');
  });
});
