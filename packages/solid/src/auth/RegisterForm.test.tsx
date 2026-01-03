// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { MockClient } from '@medplum/mock';
import { render, screen } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockMedplumProvider } from '../test-utils/MockMedplumProvider';
import { RegisterForm } from './RegisterForm';

const medplum = new MockClient();

describe('RegisterForm', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  function setup(type: 'patient' | 'project' = 'patient'): void {
    render(() => (
      <MockMedplumProvider medplum={medplum}>
        <RegisterForm
          type={type}
          projectId="123"
          googleClientId="123"
          recaptchaSiteKey="123"
          onSuccess={() => {}}
        />
      </MockMedplumProvider>
    ));
  }

  test('Renders patient form', async () => {
    setup('patient');
    await vi.advanceTimersByTimeAsync(100);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });

  test('Renders project form', async () => {
    setup('project');
    await vi.advanceTimersByTimeAsync(100);
    expect(screen.getByText('Create an account')).toBeInTheDocument();
  });
});
