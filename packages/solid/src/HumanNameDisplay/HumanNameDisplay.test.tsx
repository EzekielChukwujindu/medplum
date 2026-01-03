// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { HumanNameDisplay } from './HumanNameDisplay';
import type { HumanName } from '@medplum/fhirtypes';

describe('HumanNameDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => <HumanNameDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders formatted name', () => {
    const name: HumanName = {
      given: ['John', 'Jacob'],
      family: 'Smith',
    };
    render(() => <HumanNameDisplay value={name} />);
    expect(screen.getByText(/John/)).toBeTruthy();
    expect(screen.getByText(/Smith/)).toBeTruthy();
  });

  test('Renders with options', () => {
    const name: HumanName = {
      prefix: ['Dr.'],
      given: ['Jane'],
      family: 'Doe',
      suffix: ['MD'],
    };
    render(() => <HumanNameDisplay value={name} options={{ all: true }} />);
    expect(screen.getByText(/Dr\./)).toBeTruthy();
    expect(screen.getByText(/MD/)).toBeTruthy();
  });
});
