// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { IdentifierDisplay } from './IdentifierDisplay';
import type { Identifier } from '@medplum/fhirtypes';

describe('IdentifierDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <IdentifierDisplay />);
    expect(document.body.textContent?.trim()).toBe(':');
  });

  test('Renders identifier with system and value', () => {
    const identifier: Identifier = {
      system: 'http://example.org/mrn',
      value: '12345',
    };
    render(() => <IdentifierDisplay value={identifier} />);
    expect(screen.getByText(/http:\/\/example.org\/mrn/)).toBeTruthy();
    expect(screen.getByText(/12345/)).toBeTruthy();
  });

  test('Renders identifier with only value', () => {
    const identifier: Identifier = {
      value: 'ABC-123',
    };
    render(() => <IdentifierDisplay value={identifier} />);
    expect(screen.getByText(/ABC-123/)).toBeTruthy();
  });
});
