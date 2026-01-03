// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Dialog } from './Dialog';

describe('Dialog', () => {
  test('Renders when open', () => {
    render(() => (
      <Dialog open title="Test Dialog" testId="dialog">
        Dialog content
      </Dialog>
    ));
    expect(screen.getByText('Test Dialog')).toBeTruthy();
    expect(screen.getByText('Dialog content')).toBeTruthy();
  });

  test('Renders description', () => {
    render(() => (
      <Dialog open title="Title" description="A description" testId="dialog">
        Content
      </Dialog>
    ));
    expect(screen.getByText('A description')).toBeTruthy();
  });
});
