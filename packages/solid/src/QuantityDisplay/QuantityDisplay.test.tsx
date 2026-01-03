// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { QuantityDisplay } from './QuantityDisplay';
import type { Quantity } from '@medplum/fhirtypes';

describe('QuantityDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <QuantityDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders quantity with value and unit', () => {
    const quantity: Quantity = {
      value: 120,
      unit: 'mmHg',
    };
    render(() => <QuantityDisplay value={quantity} />);
    expect(screen.getByText(/120/)).toBeTruthy();
    expect(screen.getByText(/mmHg/)).toBeTruthy();
  });

  test('Renders quantity with only value', () => {
    const quantity: Quantity = {
      value: 98.6,
    };
    render(() => <QuantityDisplay value={quantity} />);
    expect(screen.getByText(/98.6/)).toBeTruthy();
  });
});
