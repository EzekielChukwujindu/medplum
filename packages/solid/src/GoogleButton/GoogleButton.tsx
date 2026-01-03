// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { BaseLoginRequest, GoogleCredentialResponse, LoginAuthenticationResponse } from '@medplum/core';
import { normalizeErrorString } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal, createEffect, onMount, Show } from 'solid-js';
import { getGoogleClientId } from './GoogleButton.utils';

interface GoogleApi {
  readonly accounts: {
    id: {
      initialize: (args: {
        client_id: string | undefined;
        callback: (response: GoogleCredentialResponse) => void;
      }) => void;
      renderButton: (parent: HTMLElement, args: {
        type: string;
        logo_alignment: string;
        width: number;
      }) => void;
    };
  };
}

declare const google: GoogleApi | undefined;

export interface GoogleButtonProps extends BaseLoginRequest {
  /** Google OAuth client ID (required) */
  readonly googleClientId?: string;
  /** Callback on successful authentication */
  readonly onSuccess: (response: LoginAuthenticationResponse) => void;
  /** Callback on error */
  readonly onError: (error: Error) => void;
}

/**
 * GoogleButton renders the official Google Sign-In button.
 * Handles loading the Google Identity Services script and OAuth flow.
 * @param props
 */
export function GoogleButton(props: GoogleButtonProps): JSX.Element | null {
  const medplum = useMedplum();
  let containerRef: HTMLDivElement | undefined;
  
  const [scriptLoaded, setScriptLoaded] = createSignal(typeof google !== 'undefined');
  const [initialized, setInitialized] = createSignal(false);
  const [buttonRendered, setButtonRendered] = createSignal(false);

  // Get Google client ID from props or env
  const googleClientId = () => getGoogleClientId(props.googleClientId);

  // Load Google Identity Services script
  onMount(() => {
    if (typeof google === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => props.onError(new Error('Failed to load Google Sign-In'));
      document.head.appendChild(script);
    }
  });

  // Handle Google credential response
  const handleGoogleCredential = async (credentialResponse: GoogleCredentialResponse) => {
    try {
      const response = await medplum.startGoogleLogin({
        googleClientId: googleClientId() || '',
        googleCredential: credentialResponse.credential,
        projectId: props.projectId,
        clientId: props.clientId,
        scope: props.scope,
        nonce: props.nonce,
        launch: props.launch,
        codeChallenge: props.codeChallenge,
        codeChallengeMethod: props.codeChallengeMethod,
        redirectUri: props.redirectUri,
      });
      props.onSuccess(response);
    } catch (error) {
      props.onError(error instanceof Error ? error : new Error(normalizeErrorString(error)));
    }
  };

  // Initialize Google Identity Services when script is loaded
  createEffect(() => {
    const clientId = googleClientId();
    if (!scriptLoaded() || !clientId || typeof google === 'undefined') {return;}

    if (!initialized()) {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });
      setInitialized(true);
    }

    if (containerRef && !buttonRendered()) {
      google.accounts.id.renderButton(containerRef, {
        type: 'standard',
        logo_alignment: 'center',
        width: containerRef.clientWidth || 300,
      });
      setButtonRendered(true);
    }
  });

  // Don't render if no Google client ID
  if (!googleClientId()) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      class="w-full h-10 flex justify-center items-center"
    >
      <Show when={!scriptLoaded()}>
        <span class="loading loading-spinner loading-sm" />
      </Show>
    </div>
  );
}
