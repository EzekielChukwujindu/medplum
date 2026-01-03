// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { fireEvent, render, screen } from '@solidjs/testing-library';
import { describe, expect, test } from 'vitest';
import type { ResourceDiffRowProps } from './ResourceDiffRow';
import { ResourceDiffRow } from './ResourceDiffRow';

describe('ResourceDiffRow', () => {
  function setup(props: ResourceDiffRowProps): void {
    render(() => (
      <table>
        <tbody>
          <ResourceDiffRow {...props} />
        </tbody>
      </table>
    ));
  }

  test('Text diff', () => {
    setup({
      name: 'Add name',
      path: 'given',
      property: undefined,
      originalValue: { type: 'string', value: 'Bart' },
      revisedValue: { type: 'string', value: 'Homer' },
    });

    expect(screen.getByText('Homer')).toBeDefined();
    // Solid implementation renders both original and revised in separate columns
    expect(screen.getByText('Bart')).toBeDefined();
  });

  test('Attachment Expand/Collapse', () => {
    setup({
      name: 'Replace sourceCode',
      path: 'Bot.sourceCode',
      property: {
        description: 'Bot source code',
        path: 'Bot.sourceCode',
        min: 0,
        max: 1,
        type: [
          {
            code: 'Attachment',
          },
        ],
      },
      originalValue: {
        type: 'Attachment',
        value: {
          contentType: 'text/typescript',
          title: 'old.ts',
          url: 'http://example.com/old.pdf',
        },
      },
      revisedValue: {
        type: 'Attachment',
        value: {
          contentType: 'text/typescript',
          url: 'http://example.com/new.ts',
          title: 'new.ts',
        },
      },
    });

    // Initially collapsed, should show "Expand" button
    const button = screen.getByText('Expand');
    expect(button).toBeDefined();

    // Click expand
    fireEvent.click(button);

    // Button should be gone
    expect(screen.queryByText('Expand')).toBeNull();

    // Content should be visible
    expect(screen.getByText('new.ts')).toBeDefined();
    expect(screen.getByText('old.ts')).toBeDefined();
  });

  test('No Attachment diff - No Expand button', () => {
    setup({
      name: 'Add name',
      path: 'given',
      property: undefined,
      originalValue: { type: 'string', value: 'Bart' },
      revisedValue: { type: 'string', value: 'Homer' },
    });

    expect(screen.queryByText('Expand')).toBeNull();
  });
});
