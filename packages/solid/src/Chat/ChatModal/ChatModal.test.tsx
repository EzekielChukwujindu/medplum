// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { DrAliceSmith, MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { fireEvent, render, screen } from '@solidjs/testing-library';
import type { JSX } from 'solid-js';
import { describe, expect, test } from 'vitest';
import { ChatModal  } from './ChatModal';
import type {ChatModalProps} from './ChatModal';

const medplum = new MockClient({ profile: DrAliceSmith });

describe('ChatModal', () => {
  function TestComponent(props: Partial<ChatModalProps>): JSX.Element {
    return (
      <ChatModal open={props.open as boolean} {...props} children={<div>Rendered!</div>} />
    );
  }

  function setup(props?: Partial<ChatModalProps>, client = medplum): void {
    render(() => (
      <MedplumProvider medplum={client}>
        <TestComponent {...props} />
      </MedplumProvider>
    ));
  }

  test('Render nothing when no profile', () => {
    const noProfileClient = new MockClient({ profile: null });
    setup({}, noProfileClient);
    expect(screen.queryByLabelText('Open chat')).toBeNull();
  });

  test('Render when profile exists', () => {
    setup();
    expect(screen.getByLabelText('Open chat')).toBeInTheDocument();
  });

  test('Setting `open` to `true`', () => {
    setup({ open: true });
    // If open=true, it shows Close button (down arrow)
    expect(screen.getByLabelText('Close chat')).toBeInTheDocument();
    expect(screen.getByText('Rendered!')).toBeInTheDocument();
  });

  test('Clicking toggles chat open and closed', () => {
    setup();
    const openButton = screen.getByLabelText('Open chat');
    expect(screen.queryByText('Rendered!')).toBeNull();
    
    fireEvent.click(openButton);
    expect(screen.getByText('Rendered!')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('Close chat');
    fireEvent.click(closeButton);
    expect(screen.queryByText('Rendered!')).toBeNull();
  });
});
