// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { render, screen } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import { NoteDisplay  } from './NoteDisplay';
import type {NoteDisplayProps} from './NoteDisplay';

const medplum = new MockClient();

describe('NoteDisplay', () => {
  function setup(args: NoteDisplayProps): void {
    render(() => (
      <MedplumProvider medplum={medplum}>
        <NoteDisplay {...args} />
      </MedplumProvider>
    ));
  }

  test('Renders array', () => {
    setup({ value: [{ text: 'Hello World' }, { text: 'Goodbye Moon' }] });

    expect(screen.getByText('Hello World')).toBeDefined();
    expect(screen.getByText('Goodbye Moon')).toBeDefined();
  });

  test('Renders author by reference', () => {
    setup({
      value: [{ text: 'Hello World', authorReference: { display: 'Medplum Bots' } }],
    });

    expect(screen.getByText('Medplum Bots', { exact: false })).toBeDefined();
  });

  test('Renders author by value', () => {
    setup({
      value: [{ text: 'Hello World', authorString: 'Medplum Bots' }],
    });

    expect(screen.getByText('Medplum Bots', { exact: false })).toBeDefined();
  });
});
