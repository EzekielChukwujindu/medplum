// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Popover } from './Popover';

describe('Popover', () => {
  test('Renders trigger', () => {
    render(() => (
      <Popover trigger="Click me" testId="popover">
        Popover content
      </Popover>
    ));
    expect(screen.getByText('Click me')).toBeTruthy();
  });
});
