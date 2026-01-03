// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { LoginAuthenticationResponse } from '@medplum/core';
import { normalizeErrorString } from '@medplum/core';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createSignal, Show } from 'solid-js';
import { Button } from '../Button/Button';
import { TextInput } from '../TextInput/TextInput';
import { Alert } from '../Alert/Alert';

export interface NewProjectFormProps {
  /** Login identifier from previous step */
  readonly login: string;
  /** Handler for auth response */
  readonly handleAuthResponse: (response: LoginAuthenticationResponse) => void;
}

/**
 * NewProjectForm allows users to create a new project during sign-in.
 * @param props
 */
export function NewProjectForm(props: NewProjectFormProps): JSX.Element {
  const medplum = useMedplum();
  const [projectName, setProjectName] = createSignal('');
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | undefined>();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(undefined);
    setLoading(true);

    try {
      const response = await medplum.post('auth/newproject', {
        login: props.login,
        projectName: projectName(),
      });
      props.handleAuthResponse(response);
    } catch (err) {
      setError(normalizeErrorString(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="space-y-6">
      <div class="text-center">
        <h1 class="text-2xl font-bold">Create a new project</h1>
        <p class="text-base-content/60 mt-1">
          Enter a name for your new project
        </p>
      </div>

      <Show when={error()}>
        <Alert type="error">
          {error()}
        </Alert>
      </Show>

      <form onSubmit={handleSubmit} class="space-y-4">
        <TextInput
          type="text"
          name="projectName"
          label="Project Name"
          placeholder="My Healthcare Project"
          value={projectName()}
          onChange={setProjectName}
          required
        />

        <Button
          type="submit"
          class="w-full"
          loading={loading()}
          disabled={loading() || !projectName().trim()}
        >
          Create Project
        </Button>
      </form>
    </div>
  );
}
