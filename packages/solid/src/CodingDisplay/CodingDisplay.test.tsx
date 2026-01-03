// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { CodingDisplay } from './CodingDisplay';
import type { Coding } from '@medplum/fhirtypes';

describe('CodingDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <CodingDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders coding display', () => {
    const coding: Coding = {
      system: 'http://loinc.org',
      code: '8480-6',
      display: 'Systolic blood pressure',
    };
    render(() => <CodingDisplay value={coding} />);
    expect(screen.getByText('Systolic blood pressure')).toBeTruthy();
  });

  test('Renders code when no display', () => {
    const coding: Coding = {
      system: 'http://loinc.org',
      code: '8480-6',
    };
    render(() => <CodingDisplay value={coding} />);
    expect(screen.getByText('8480-6')).toBeTruthy();
  });
});
