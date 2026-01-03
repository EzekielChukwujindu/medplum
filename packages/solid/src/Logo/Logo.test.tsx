// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Logo } from './Logo';

describe('Logo', () => {
  test('Renders', () => {
    render(() => <Logo size={100} />);
    expect(screen.getByTitle('Medplum Logo')).toBeTruthy();
  });

  test('Renders with custom fill', () => {
    render(() => <Logo size={100} fill="#ff0000" />);
    expect(screen.getByTitle('Medplum Logo')).toBeTruthy();
  });
});
