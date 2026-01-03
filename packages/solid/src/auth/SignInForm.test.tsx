// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { SignInForm } from './SignInForm';

function renderWithProvider(ui: () => any, medplum?: MockClient) {
  const client = medplum ?? new MockClient();
  return render(() => (
    <MedplumProvider medplum={client}>
      {ui()}
    </MedplumProvider>
  ));
}

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Renders initial sign-in form', () => {
    renderWithProvider(() => <SignInForm />);
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  test('Shows forgot password link when onForgotPassword provided', () => {
    const onForgotPassword = vi.fn();
    renderWithProvider(() => (
      <SignInForm onForgotPassword={onForgotPassword} />
    ));
    
    expect(screen.getByText('Forgot password?')).toBeDefined();
  });

  test('Shows register link when onRegister provided', () => {
    const onRegister = vi.fn();
    renderWithProvider(() => (
      <SignInForm onRegister={onRegister} />
    ));
    
    expect(screen.getByText('Sign up')).toBeDefined();
  });

  test('Calls onRegister when register link clicked', async () => {
    const onRegister = vi.fn();
    renderWithProvider(() => (
      <SignInForm onRegister={onRegister} />
    ));
    
    await fireEvent.click(screen.getByText('Sign up'));
    expect(onRegister).toHaveBeenCalled();
  });

  test('Hides Google auth when disableGoogleAuth is true', () => {
    renderWithProvider(() => (
      <SignInForm disableGoogleAuth={true} />
    ));
    
    // Google button should not be rendered
    expect(screen.queryByText(/continue with google/i)).toBeNull();
  });

  test('Hides email auth when disableEmailAuth is true', () => {
    renderWithProvider(() => (
      <SignInForm disableEmailAuth={true} />
    ));
    
    expect(screen.queryByLabelText(/email/i)).toBeNull();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });
});
