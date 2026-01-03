// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { BaseLoginRequest, LoginAuthenticationResponse } from '@medplum/core';
import { normalizeErrorString } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentComponent } from 'solid-js';
import { createSignal, Show, onMount } from 'solid-js';
import { Document } from '../Document/Document';
import { AuthenticationForm } from './AuthenticationForm';
import { ChooseProfileForm } from './ChooseProfileForm';
import { MfaForm } from './MfaForm';
import { NewProjectForm } from './NewProjectForm';
import { Alert } from '../Alert/Alert';

export interface SignInFormProps extends BaseLoginRequest {
  /** Login code to resume an existing login flow */
  readonly login?: string;
  /** Whether to show scope selection */
  readonly chooseScopes?: boolean;
  /** Disable email/password authentication */
  readonly disableEmailAuth?: boolean;
  /** Disable Google authentication */
  readonly disableGoogleAuth?: boolean;
  /** Callback on successful sign-in */
  readonly onSuccess?: () => void;
  /** Callback for forgot password link */
  readonly onForgotPassword?: () => void;
  /** Callback for register link */
  readonly onRegister?: () => void;
  /** Callback when code is received (for custom handling) */
  readonly onCode?: (code: string) => void;
  /** Children rendered in AuthenticationForm */
  readonly children?: JSX.Element;
}

/**
 * SignInForm handles the multi-step sign-in process:
 * 1. Authentication - identify the user
 * 2. MFA - if enabled, prompt for MFA code
 * 3. Choose profile - if multiple profiles exist
 * 4. Success - return to caller with code or redirect
 * 
 * This component uses Layer 1 (Shell/Background) for hospital branding.
 * @param props
 */
export const SignInForm: ParentComponent<SignInFormProps> = (props) => {
  const medplum = useMedplum();
  
  const [login, setLogin] = createSignal<string | undefined>(undefined);
  const [mfaRequired, setMfaRequired] = createSignal(false);
  const [mfaEnrollRequired, setMfaEnrollRequired] = createSignal(false);
  const [enrollQrCode, setEnrollQrCode] = createSignal<string | undefined>();
  const [memberships, setMemberships] = createSignal<any[] | undefined>();
  const [error, setError] = createSignal<string | undefined>();
  const [loginRequestedRef, setLoginRequestedRef] = createSignal(false);

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
    setMfaEnrollRequired(!!response.mfaEnrollRequired);
    setEnrollQrCode(response.enrollQrCode);
    setMfaRequired(!!response.mfaRequired);

    if (response.login) {
      setLogin(response.login);
    }

    if (response.memberships) {
      setMemberships(response.memberships);
    }

    if (response.code) {
      if (props.chooseScopes) {
        setMemberships(undefined);
      } else {
        handleCode(response.code);
      }
    }
  };

  // Resume existing login if login code provided
  onMount(() => {
    if (props.login && !loginRequestedRef() && !login()) {
      setLoginRequestedRef(true);
      medplum
        .get('auth/login/' + props.login)
        .then(handleAuthResponse)
        .catch((err) => setError(normalizeErrorString(err)));
    }
  });

  const renderStep = () => {
    const currentLogin = login();
    
    if (!currentLogin) {
      // Step 1: Authentication
      return (
        <AuthenticationForm
          onForgotPassword={props.onForgotPassword}
          onRegister={props.onRegister}
          handleAuthResponse={handleAuthResponse}
          disableGoogleAuth={props.disableGoogleAuth}
          disableEmailAuth={props.disableEmailAuth}
          projectId={props.projectId}
          clientId={props.clientId}
          scope={props.scope}
          nonce={props.nonce}
          launch={props.launch}
          codeChallenge={props.codeChallenge}
          codeChallengeMethod={props.codeChallengeMethod}
          redirectUri={props.redirectUri}
        >
          {props.children}
        </AuthenticationForm>
      );
    }

    if (mfaEnrollRequired() && enrollQrCode()) {
      // Step 2a: MFA Enrollment
      return (
        <MfaForm
          title="Enroll in MFA"
          description="Scan this QR code with your authenticator app."
          buttonText="Enroll"
          qrCodeUrl={enrollQrCode()}
          onSubmit={async (token: string) => {
            const res = await medplum.post('auth/mfa/login-enroll', {
              login: currentLogin,
              token,
            });
            handleAuthResponse(res);
          }}
        />
      );
    }

    if (mfaRequired()) {
      // Step 2b: MFA Verification
      return (
        <MfaForm
          title="Enter MFA code"
          description="Enter the code from your authenticator app."
          buttonText="Submit Code"
          onSubmit={async (token: string) => {
            const res = await medplum.post('auth/mfa/verify', {
              login: currentLogin,
              token,
            });
            handleAuthResponse(res);
          }}
        />
      );
    }

    if (props.projectId === 'new') {
      // Step 3a: New Project
      return (
        <NewProjectForm
          login={currentLogin}
          handleAuthResponse={handleAuthResponse}
        />
      );
    }

    if (memberships()) {
      // Step 3b: Choose Profile
      return (
        <ChooseProfileForm
          login={currentLogin}
          memberships={memberships()!}
          handleAuthResponse={handleAuthResponse}
        />
      );
    }

    // Success state
    return <div class="text-center text-success">Success</div>;
  };

  return (
    <Document class="max-w-md mx-auto">
      <Show when={error()}>
        <Alert type="error" class="mb-4">
          {error()}
        </Alert>
      </Show>
      {renderStep()}
    </Document>
  );
};
