// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Drawer } from './Drawer';

describe('Drawer', () => {
  test('Renders drawer', () => {
    render(() => (
      <Drawer testId="drawer">
        Drawer content
      </Drawer>
    ));
    expect(screen.getByTestId('drawer')).toBeTruthy();
  });

  test('Renders children', () => {
    render(() => (
      <Drawer testId="drawer">
        <nav>Navigation</nav>
      </Drawer>
    ));
    expect(screen.getByText('Navigation')).toBeTruthy();
  });

  test('Has drawer class', () => {
    render(() => <Drawer testId="drawer">Content</Drawer>);
    const drawer = screen.getByTestId('drawer');
    expect(drawer.classList.contains('drawer')).toBe(true);
  });
});
