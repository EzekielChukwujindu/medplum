// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { RangeDisplay } from './RangeDisplay';
import type { Range } from '@medplum/fhirtypes';

describe('RangeDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <RangeDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders range with low and high', () => {
    const range: Range = {
      low: { value: 60, unit: 'mmHg' },
      high: { value: 120, unit: 'mmHg' },
    };
    render(() => <RangeDisplay value={range} />);
    expect(screen.getByText(/60/)).toBeTruthy();
    expect(screen.getByText(/120/)).toBeTruthy();
  });

  test('Renders range with only low', () => {
    const range: Range = {
      low: { value: 50, unit: 'mg' },
    };
    render(() => <RangeDisplay value={range} />);
    expect(screen.getByText(/50/)).toBeTruthy();
  });
});
