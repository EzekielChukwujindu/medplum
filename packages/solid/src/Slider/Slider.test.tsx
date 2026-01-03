// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Slider } from './Slider';

describe('Slider', () => {
  test('Renders slider', () => {
    render(() => <Slider testId="slider" />);
    expect(screen.getByTestId('slider')).toBeTruthy();
  });

  test('Renders with label', () => {
    render(() => <Slider label="Volume" testId="slider" />);
    expect(screen.getByText('Volume')).toBeTruthy();
  });
});
