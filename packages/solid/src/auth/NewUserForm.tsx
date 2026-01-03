// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { BaseLoginRequest, LoginAuthenticationResponse, NewUserRequest } from '@medplum/core';
import { normalizeErrorString } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentComponent } from 'solid-js';
import { createSignal, Show, createEffect } from 'solid-js';
import { getRecaptcha, initRecaptcha } from '../utils/recaptcha';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Divider } from '../Divider/Divider';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { Alert } from '../Alert/Alert';
import { Document } from '../Document/Document';

export interface NewUserFormProps extends BaseLoginRequest {
  /** Callback on successful registration */
  readonly onSuccess?: () => void;
  /** Callback for sign in link */
  readonly onSignIn?: () => void;
  /** Callback when code is received */
  readonly onCode?: (code: string) => void;
  /** Disable Google authentication */
  readonly disableGoogleAuth?: boolean;
  /** Children rendered below the form */
  readonly children?: JSX.Element;
  /** reCAPTCHA site key */
  readonly recaptchaSiteKey?: string;
  /** Google Client ID */
  readonly googleClientId?: string;
  /** Callback for handling auth response (for wrapper components) */
  readonly handleAuthResponse?: (response: LoginAuthenticationResponse) => void;
}

/**
 * NewUserForm handles new user registration.
 * Collects name, email, password and creates a new account.
 * @param props
 */
export const NewUserForm: ParentComponent<NewUserFormProps> = (props) => {
  const medplum = useMedplum();
  
  const [firstName, setFirstName] = createSignal('');
  const [lastName, setLastName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  createEffect(() => {
    if (props.recaptchaSiteKey) {
      initRecaptcha(props.recaptchaSiteKey);
    }
  });

  const handleCode = (code: string) => {
    if (props.onCode) {
      props.onCode(code);
    } else {
      medplum
        .processCode(code)
        .then(() => props.onSuccess?.())
        .catch((err) => setError(normalizeErrorString(err)));
    }
  };

  const handleAuthResponse = (response: LoginAuthenticationResponse) => {
    if (response.code) {
      handleCode(response.code);
    }
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(undefined);

    if (password() !== confirmPassword()) {
      setError('Passwords do not match');
      return;
    }

    if (password().length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const request: NewUserRequest = {
        firstName: firstName(),
        lastName: lastName(),
        email: email(),
        password: password(),
        recaptchaToken: props.recaptchaSiteKey ? await getRecaptcha(props.recaptchaSiteKey) : '',
        projectId: props.projectId,
        clientId: props.clientId,
      };

      const response = await medplum.startNewUser(request);
      handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Document class="max-w-md mx-auto">
      <div class="space-y-6">
        <div class="text-center">
          <h1 class="text-2xl font-bold">Create an account</h1>
          <p class="text-base-content/60 mt-1">Get started with your free account</p>
        </div>

        <Show when={error()}>
          <Alert type="error">
            {error()}
          </Alert>
        </Show>

        {/* Google OAuth */}
        <Show when={!props.disableGoogleAuth}>
          <GoogleButton
            onSuccess={handleAuthResponse}
            onError={(err) => setError(normalizeErrorString(err))}
            projectId={props.projectId}
            clientId={props.clientId}
            nonce={props.nonce}
            codeChallenge={props.codeChallenge}
            codeChallengeMethod={props.codeChallengeMethod}
            redirectUri={props.redirectUri}
          />
          
          <Divider label="or register with email" />
        </Show>

        <form onSubmit={handleSubmit} class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <TextInput
              type="text"
              name="firstName"
              label="First Name"
              placeholder="John"
              value={firstName()}
              onChange={setFirstName}
              required
            />
            <TextInput
              type="text"
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              value={lastName()}
              onChange={setLastName}
              required
            />
          </div>

          <TextInput
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            value={email()}
            onChange={setEmail}
            required
          />

          <TextInput
            type="password"
            name="password"
            label="Password"
            placeholder="At least 8 characters"
            value={password()}
            onChange={setPassword}
            required
          />

          <TextInput
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword()}
            onChange={setConfirmPassword}
            required
          />

          <Button
            type="submit"
            class="w-full"
            loading={loading()}
            disabled={loading()}
          >
            Create Account
          </Button>
        </form>

        {/* Sign in link */}
        <Show when={props.onSignIn}>
          <div class="text-center text-sm">
            <span class="text-base-content/60">Already have an account? </span>
            <button
              type="button"
              class="link link-primary"
              onClick={props.onSignIn}
            >
              Sign in
            </button>
          </div>
        </Show>

        {/* Custom children */}
        {props.children}
      </div>
    </Document>
  );
};
