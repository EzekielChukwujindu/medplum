// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { MoneyDisplay } from './MoneyDisplay';
import type { Money } from '@medplum/fhirtypes';

describe('MoneyDisplay', () => {
  test('Renders empty when value is undefined', () => {
    render(() => <MoneyDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders money with currency', () => {
    const money: Money = {
      value: 123.45,
      currency: 'USD',
    };
    render(() => <MoneyDisplay value={money} />);
    // formatMoney returns formatted like "$123.45"
    expect(screen.getByText(/\$123\.45/)).toBeTruthy();
  });

  test('Renders money without currency', () => {
    const money: Money = {
      value: 99.99,
    };
    render(() => <MoneyDisplay value={money} />);
    expect(screen.getByText(/99.99/)).toBeTruthy();
  });
});
