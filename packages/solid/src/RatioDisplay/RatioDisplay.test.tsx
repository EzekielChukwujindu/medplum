// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { RatioDisplay } from './RatioDisplay';
import type { Ratio } from '@medplum/fhirtypes';

describe('RatioDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => <RatioDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders ratio with numerator and denominator', () => {
    const ratio: Ratio = {
      numerator: { value: 1, unit: 'mg' },
      denominator: { value: 2, unit: 'mL' },
    };
    render(() => <RatioDisplay value={ratio} />);
    expect(screen.getByText(/1/)).toBeTruthy();
    expect(screen.getByText(/2/)).toBeTruthy();
    expect(screen.getByText(/\//)).toBeTruthy();
  });
});
