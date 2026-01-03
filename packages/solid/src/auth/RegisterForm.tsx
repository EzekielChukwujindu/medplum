// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { LoginAuthenticationResponse } from '@medplum/core';
import { normalizeOperationOutcome } from '@medplum/core';
import type { OperationOutcome } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX, ParentProps } from 'solid-js';
import { createEffect, createSignal, Show } from 'solid-js';
import { Document } from '../Document/Document';
import { OperationOutcomeAlert } from '../OperationOutcomeAlert/OperationOutcomeAlert';
import { getIssuesForExpression } from '../utils/outcomes';
import { NewProjectForm } from './NewProjectForm';
import { NewUserForm } from './NewUserForm';

export interface RegisterFormProps extends ParentProps {
  readonly type: 'patient' | 'project';
  readonly projectId?: string;
  readonly clientId?: string;
  readonly googleClientId?: string;
  readonly recaptchaSiteKey?: string;
  readonly onSuccess: () => void;
}

export function RegisterForm(props: RegisterFormProps): JSX.Element {
  const medplum = useMedplum();
  const [login, setLogin] = createSignal<string | undefined>();
  const [outcome, setOutcome] = createSignal<OperationOutcome | undefined>();

  createEffect(() => {
    const loginVal = login();
    if (props.type === 'patient' && loginVal && props.projectId) {
      medplum
        .startNewPatient({ login: loginVal, projectId: props.projectId })
        .then((response) => medplum.processCode(response.code as string))
        .then(() => props.onSuccess())
        .catch((err) => setOutcome(normalizeOperationOutcome(err)));
    }
  });

  function handleAuthResponse(response: LoginAuthenticationResponse): void {
    if (response.code) {
      medplum
        .processCode(response.code)
        .then(() => props.onSuccess())
        .catch((err) => setOutcome(normalizeOperationOutcome(err)));
    } else if (response.login) {
      setLogin(response.login);
    }
  }

  const issues = () => getIssuesForExpression(outcome(), undefined);

  return (
    <Document class="max-w-md mx-auto p-6">
      <OperationOutcomeAlert issues={issues()} />
      <Show when={!login()}>
        <NewUserForm
          projectId={props.projectId ?? ''}
          clientId={props.clientId}
          googleClientId={props.googleClientId}
          recaptchaSiteKey={props.recaptchaSiteKey}
          handleAuthResponse={handleAuthResponse}
        >
          {props.children}
        </NewUserForm>
      </Show>
      <Show when={login() && props.type === 'project'}>
        <NewProjectForm login={login()!} handleAuthResponse={handleAuthResponse} />
      </Show>
    </Document>
  );
}
