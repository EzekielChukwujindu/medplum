// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Select  } from './Select';
import type {SelectOption} from './Select';

describe('Select', () => {
  const options: SelectOption[] = [
    { value: 'a', label: 'Option A' },
    { value: 'b', label: 'Option B' },
  ];

  test('Renders with label', () => {
    render(() => <Select options={options} label="Choose" testId="select" />);
    expect(screen.getByText('Choose')).toBeTruthy();
  });

  test('Shows placeholder', () => {
    render(() => <Select options={options} placeholder="Pick one" testId="select" />);
    expect(screen.getByText('Pick one')).toBeTruthy();
  });

  test('Shows required indicator', () => {
    render(() => <Select options={options} label="Required" required testId="select" />);
    expect(screen.getByText('*')).toBeTruthy();
  });
});
