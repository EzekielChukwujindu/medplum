// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { render, screen, fireEvent } from '@solidjs/testing-library';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/solid-hooks';
import { AuthenticationForm } from './AuthenticationForm';

function renderWithProvider(ui: () => any, medplum?: MockClient) {
  const client = medplum ?? new MockClient();
  return render(() => (
    <MedplumProvider medplum={client}>
      {ui()}
    </MedplumProvider>
  ));
}

describe('AuthenticationForm', () => {
  const mockHandleAuthResponse = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('Renders email and password fields', () => {
    renderWithProvider(() => (
      <AuthenticationForm handleAuthResponse={mockHandleAuthResponse} />
    ));
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeDefined();
    expect(screen.getByLabelText(/email/i)).toBeDefined();
    expect(screen.getByLabelText(/password/i)).toBeDefined();
  });

  test('Renders sign in button', () => {
    renderWithProvider(() => (
      <AuthenticationForm handleAuthResponse={mockHandleAuthResponse} />
    ));
    
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDefined();
  });

  test('Shows forgot password link', () => {
    const onForgotPassword = vi.fn();
    renderWithProvider(() => (
      <AuthenticationForm 
        handleAuthResponse={mockHandleAuthResponse}
        onForgotPassword={onForgotPassword}
      />
    ));
    
    expect(screen.getByText('Forgot password?')).toBeDefined();
  });

  test('Calls onForgotPassword when clicked', async () => {
    const onForgotPassword = vi.fn();
    renderWithProvider(() => (
      <AuthenticationForm 
        handleAuthResponse={mockHandleAuthResponse}
        onForgotPassword={onForgotPassword}
      />
    ));
    
    await fireEvent.click(screen.getByText('Forgot password?'));
    expect(onForgotPassword).toHaveBeenCalled();
  });

  test('Hides email fields when disableEmailAuth is true', () => {
    renderWithProvider(() => (
      <AuthenticationForm 
        handleAuthResponse={mockHandleAuthResponse}
        disableEmailAuth={true}
      />
    ));
    
    expect(screen.queryByLabelText(/email/i)).toBeNull();
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  test('Renders register link when onRegister provided', () => {
    const onRegister = vi.fn();
    renderWithProvider(() => (
      <AuthenticationForm 
        handleAuthResponse={mockHandleAuthResponse}
        onRegister={onRegister}
      />
    ));
    
    expect(screen.getByText('Sign up')).toBeDefined();
  });

  test('Calls onRegister when clicked', async () => {
    const onRegister = vi.fn();
    renderWithProvider(() => (
      <AuthenticationForm 
        handleAuthResponse={mockHandleAuthResponse}
        onRegister={onRegister}
      />
    ));
    
    await fireEvent.click(screen.getByText('Sign up'));
    expect(onRegister).toHaveBeenCalled();
  });
});
