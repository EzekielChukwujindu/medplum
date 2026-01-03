// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect } from 'vitest';
import { Steps  } from './Steps';
import type {Step} from './Steps';

describe('Steps', () => {
  const steps: Step[] = [
    { title: 'Step 1', description: 'First step' },
    { title: 'Step 2', description: 'Second step' },
    { title: 'Step 3' },
  ];

  test('Renders all steps', () => {
    render(() => <Steps steps={steps} testId="steps" />);
    expect(screen.getByText('Step 1')).toBeTruthy();
    expect(screen.getByText('Step 2')).toBeTruthy();
    expect(screen.getByText('Step 3')).toBeTruthy();
  });

  test('Renders descriptions', () => {
    render(() => <Steps steps={steps} testId="steps" />);
    expect(screen.getByText('First step')).toBeTruthy();
    expect(screen.getByText('Second step')).toBeTruthy();
  });

  test('Highlights completed and current steps', () => {
    render(() => <Steps steps={steps} current={1} testId="steps" />);
    const container = screen.getByTestId('steps');
    const stepElements = container.querySelectorAll('.step');
    expect(stepElements[0].classList.contains('step-primary')).toBe(true);
    expect(stepElements[1].classList.contains('step-primary')).toBe(true);
    expect(stepElements[2].classList.contains('step-primary')).toBe(false);
  });
});
