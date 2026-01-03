// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { operationOutcomeIssueToString } from '@medplum/core';
import type { OperationOutcome, OperationOutcomeIssue } from '@medplum/fhirtypes';
import { AlertCircle } from 'lucide-solid';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { Alert } from '../Alert/Alert';

export interface OperationOutcomeAlertProps {
  /** OperationOutcome resource to display */
  readonly outcome?: OperationOutcome;
  /** Alternatively, pass issues directly */
  readonly issues?: OperationOutcomeIssue[];
  /** Additional CSS class */
  readonly class?: string;
  /** Test ID */
  readonly testId?: string;
}

/**
 * OperationOutcomeAlert displays errors from an OperationOutcome resource.
 * Renders each issue as a separate item in an error alert.
 * @param props
 */
export function OperationOutcomeAlert(props: OperationOutcomeAlertProps): JSX.Element | null {
  const issues = () => props.outcome?.issue || props.issues;
  
  return (
    <Show when={issues()?.length}>
      <Alert type="error" class={props.class} testId={props.testId}>
        <div class="flex items-start gap-2">
          <AlertCircle class="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div class="space-y-1">
            <For each={issues()}>
              {(issue) => (
                <div data-testid="text-field-error">
                  {operationOutcomeIssueToString(issue)}
                </div>
              )}
            </For>
          </div>
        </div>
      </Alert>
    </Show>
  );
}
