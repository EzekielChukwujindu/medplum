// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { normalizeErrorString } from '@medplum/core';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Alert } from '../Alert/Alert';

export interface MfaFormProps {
  /** Form title */
  readonly title: string;
  /** Description text */
  readonly description: string;
  /** Submit button text */
  readonly buttonText: string;
  /** QR code URL for enrollment */
  readonly qrCodeUrl?: string;
  /** Submit handler */
  readonly onSubmit: (token: string) => Promise<void>;
}

/**
 * MfaForm handles MFA code entry and enrollment.
 * Displays QR code for enrollment if provided.
 * @param props
 */
export function MfaForm(props: MfaFormProps): JSX.Element {
  const [token, setToken] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      await props.onSubmit(token());
    } catch (err) {
      setError(normalizeErrorString(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">{props.title}</h1>
        <p class="text-base-content/60 mt-1">{props.description}</p>
      </div>

      <Show when={error()}>
        <Alert type="error">
          {error()}
        </Alert>
      </Show>

      {/* QR Code for enrollment */}
      <Show when={props.qrCodeUrl}>
        <div class="flex justify-center p-4 bg-white rounded-lg">
          <img
            src={props.qrCodeUrl}
            alt="MFA QR Code"
            class="w-48 h-48"
          />
        </div>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-4">
        <TextInput
          type="text"
          name="token"
          label="Verification Code"
          placeholder="Enter 6-digit code"
          value={token()}
          onChange={setToken}
          required
        />

        <Button
          type="submit"
          class="w-full"
          loading={loading()}
          disabled={loading() || token().length !== 6}
        >
          {props.buttonText}
        </Button>
      </form>
    </div>
  );
}
