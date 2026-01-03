// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { QuestionnaireFormGroup } from './QuestionnaireFormGroup';

export interface QuestionnaireFormRepeatableGroupProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItems: QuestionnaireResponseItem[];
}

export function QuestionnaireFormRepeatableGroup(props: QuestionnaireFormRepeatableGroupProps): JSX.Element {
  return (
    <>
      <For each={props.responseItems}>
        {(response) => (
          <QuestionnaireFormGroup
            formState={props.formState}
            context={props.context}
            item={props.item}
            responseItem={response}
          />
        )}
      </For>
      <button
        type="button"
        class="btn btn-link pl-0"
        onClick={() => props.formState.onAddGroup(props.context, props.item)}
      >
        {`Add Group: ${props.item.text}`}
      </button>
    </>
  );
}
