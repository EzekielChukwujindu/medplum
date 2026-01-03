// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { ContactPointDisplay } from './ContactPointDisplay';
import type { ContactPoint } from '@medplum/fhirtypes';

describe('ContactPointDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => <ContactPointDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders contact point value', () => {
    const cp: ContactPoint = {
      value: '555-1234',
    };
    render(() => <ContactPointDisplay value={cp} />);
    expect(screen.getByText('555-1234')).toBeTruthy();
  });

  test('Renders with use and system', () => {
    const cp: ContactPoint = {
      value: 'test@example.com',
      use: 'work',
      system: 'email',
    };
    render(() => <ContactPointDisplay value={cp} />);
    expect(screen.getByText(/test@example.com/)).toBeTruthy();
    expect(screen.getByText(/work/)).toBeTruthy();
    expect(screen.getByText(/email/)).toBeTruthy();
  });

  test('Renders with only use', () => {
    const cp: ContactPoint = {
      value: '555-5678',
      use: 'home',
    };
    render(() => <ContactPointDisplay value={cp} />);
    expect(screen.getByText(/home/)).toBeTruthy();
  });
});
