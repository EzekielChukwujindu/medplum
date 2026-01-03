// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireResponse, Reference } from '@medplum/fhirtypes';
import { useResource } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { QuestionnaireResponseItemDisplay } from './QuestionnaireResponseItemDisplay';

export interface QuestionnaireResponseDisplayProps {
  /** QuestionnaireResponse resource or reference */
  readonly questionnaireResponse: QuestionnaireResponse | Reference<QuestionnaireResponse>;
}

/**
 * QuestionnaireResponseDisplay renders a completed questionnaire response.
 * @param props
 */
export function QuestionnaireResponseDisplay(props: QuestionnaireResponseDisplayProps): JSX.Element {
  const questionnaireResponse = useResource(props.questionnaireResponse as Reference<QuestionnaireResponse>);

  return (
    <div class="space-y-0">
      <Show when={questionnaireResponse()}>
        {(qr) => (
          <For each={qr().item}>
            {(item, index) => (
              <QuestionnaireResponseItemDisplay item={item} />
            )}
          </For>
        )}
      </Show>
    </div>
  );
}
