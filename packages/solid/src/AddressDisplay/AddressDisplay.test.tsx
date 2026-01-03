// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { AddressDisplay } from './AddressDisplay';
import type { Address } from '@medplum/fhirtypes';

describe('AddressDisplay', () => {
  test('Renders nothing when value is undefined', () => {
    render(() => <AddressDisplay />);
    expect(document.body.textContent).toBe('');
  });

  test('Renders formatted address', () => {
    const address: Address = {
      line: ['123 Main St', 'Apt 4'],
      city: 'Boston',
      state: 'MA',
      postalCode: '02101',
    };
    render(() => <AddressDisplay value={address} />);
    expect(screen.getByText(/123 Main St/)).toBeTruthy();
    expect(screen.getByText(/Boston/)).toBeTruthy();
  });

  test('Renders single line address', () => {
    const address: Address = {
      line: ['456 Oak Ave'],
      city: 'Springfield',
    };
    render(() => <AddressDisplay value={address} />);
    expect(screen.getByText(/456 Oak Ave/)).toBeTruthy();
  });
});
