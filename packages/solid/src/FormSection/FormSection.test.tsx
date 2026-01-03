// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { FormSection } from './FormSection';

describe('FormSection', () => {
  test('Renders children', () => {
    render(() => (
      <FormSection>
        <input data-testid="input" />
      </FormSection>
    ));
    expect(screen.getByTestId('input')).toBeTruthy();
  });

  test('Renders title as label', () => {
    render(() => <FormSection title="Email Address">Content</FormSection>);
    expect(screen.getByText('Email Address')).toBeTruthy();
  });

  test('Renders description', () => {
    render(() => <FormSection description="Enter your email">Content</FormSection>);
    expect(screen.getByText('Enter your email')).toBeTruthy();
  });

  test('Shows asterisk when required', () => {
    render(() => <FormSection title="Email" withAsterisk>Content</FormSection>);
    expect(screen.getByText('*')).toBeTruthy();
  });

  test('Applies readonly styling', () => {
    render(() => <FormSection title="Email" readonly>Content</FormSection>);
    const label = document.querySelector('.label-text');
    expect(label?.classList.contains('text-base-content/60')).toBe(true);
  });

  test('Displays errors from outcome', () => {
    const outcome = {
      resourceType: 'OperationOutcome' as const,
      issue: [
        {
          severity: 'error' as const,
          code: 'invalid' as const,
          expression: ['email'],
          details: { text: 'Invalid email format' },
        },
      ],
    };
    render(() => (
      <FormSection htmlFor="email" outcome={outcome}>
        <input name="email" />
      </FormSection>
    ));
    expect(screen.getByText('Invalid email format')).toBeTruthy();
  });

  test('Applies testId', () => {
    render(() => <FormSection testId="my-section">Content</FormSection>);
    expect(screen.getByTestId('my-section')).toBeTruthy();
  });
});
