// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { BaseLoginRequest, LoginAuthenticationResponse } from '@medplum/core';
import { normalizeErrorString } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentComponent } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Divider } from '../Divider/Divider';
import { GoogleButton } from '../GoogleButton/GoogleButton';
import { Alert } from '../Alert/Alert';

export interface AuthenticationFormProps extends BaseLoginRequest {
  /** Callback for forgot password link */
  readonly onForgotPassword?: () => void;
  /** Callback for register link */
  readonly onRegister?: () => void;
  /** Handler for auth response */
  readonly handleAuthResponse: (response: LoginAuthenticationResponse) => void;
  /** Disable Google auth */
  readonly disableGoogleAuth?: boolean;
  /** Disable email/password auth */
  readonly disableEmailAuth?: boolean;
  /** Children rendered below the form */
  readonly children?: JSX.Element;
}

/**
 * AuthenticationForm handles the initial email/password authentication step.
 * Supports Google OAuth as an alternative.
 * @param props
 */
export const AuthenticationForm: ParentComponent<AuthenticationFormProps> = (props) => {
  const medplum = useMedplum();
  
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const response = await medplum.startLogin({
        email: email(),
        password: password(),
        projectId: props.projectId,
        clientId: props.clientId,
        scope: props.scope,
        nonce: props.nonce,
        launch: props.launch,
        codeChallenge: props.codeChallenge,
        codeChallengeMethod: props.codeChallengeMethod,
        redirectUri: props.redirectUri,
      });
      props.handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (response: LoginAuthenticationResponse) => {
    props.handleAuthResponse(response);
  };

  const handleGoogleError = (err: Error) => {
    setError(normalizeErrorString(err));
  };

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Sign in</h1>
        <p class="text-base-content/60 mt-1">Welcome back</p>
      </div>

      <Show when={error()}>
        <Alert type="error">
          {error()}
        </Alert>
      </Show>

      {/* Google OAuth */}
      <Show when={!props.disableGoogleAuth}>
        <GoogleButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          projectId={props.projectId}
          clientId={props.clientId}
          scope={props.scope}
          nonce={props.nonce}
          launch={props.launch}
          codeChallenge={props.codeChallenge}
          codeChallengeMethod={props.codeChallengeMethod}
          redirectUri={props.redirectUri}
        />
        
        <Show when={!props.disableEmailAuth}>
          <Divider label="or continue with email" />
        </Show>
      </Show>

      {/* Email/Password Form */}
      <Show when={!props.disableEmailAuth}>
        <form onSubmit={handleSubmit} class="space-y-4">
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
            placeholder="Enter your password"
            value={password()}
            onChange={setPassword}
            required
          />

          <Show when={props.onForgotPassword}>
            <div class="text-right">
              <button
                type="button"
                class="link link-primary text-sm"
                onClick={props.onForgotPassword}
              >
                Forgot password?
              </button>
            </div>
          </Show>

          <Button
            type="submit"
            class="w-full"
            loading={loading()}
            disabled={loading()}
          >
            Sign in
          </Button>
        </form>
      </Show>

      {/* Register link */}
      <Show when={props.onRegister}>
        <div class="text-center text-sm">
          <span class="text-base-content/60">Don't have an account? </span>
          <button
            type="button"
            class="link link-primary"
            onClick={props.onRegister}
          >
            Sign up
          </button>
        </div>
      </Show>

      {/* Custom children */}
      {props.children}
    </div>
  );
};
