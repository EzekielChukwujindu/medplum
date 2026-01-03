// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { CheckboxFormSection } from './CheckboxFormSection';

describe('CheckboxFormSection', () => {
  test('Renders children', () => {
    render(() => (
      <CheckboxFormSection>
        <input type="checkbox" data-testid="checkbox" />
      </CheckboxFormSection>
    ));
    expect(screen.getByTestId('checkbox')).toBeTruthy();
  });

  test('Renders title', () => {
    render(() => (
      <CheckboxFormSection title="Accept terms">
        <input type="checkbox" />
      </CheckboxFormSection>
    ));
    expect(screen.getByText('Accept terms')).toBeTruthy();
  });

  test('Renders description', () => {
    render(() => (
      <CheckboxFormSection title="Subscribe" description="Get updates via email">
        <input type="checkbox" />
      </CheckboxFormSection>
    ));
    expect(screen.getByText('Get updates via email')).toBeTruthy();
  });

  test('Shows required asterisk', () => {
    render(() => (
      <CheckboxFormSection title="Required" withAsterisk>
        <input type="checkbox" />
      </CheckboxFormSection>
    ));
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Applies testId', () => {
    render(() => (
      <CheckboxFormSection testId="my-section">
        <input type="checkbox" />
      </CheckboxFormSection>
    ));
    expect(screen.getByTestId('my-section')).toBeTruthy();
  });
});
