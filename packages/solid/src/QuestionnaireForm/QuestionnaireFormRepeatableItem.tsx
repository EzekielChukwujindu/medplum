// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { QuestionnaireFormItem } from './QuestionnaireFormItem';

export interface QuestionnaireFormRepeatableItemProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormRepeatableItem(props: QuestionnaireFormRepeatableItemProps): JSX.Element {
  return (
    <>
      <For each={props.responseItem.answer}>
        {(answer, index) => (
          <QuestionnaireFormItem
            formState={props.formState}
            context={props.context}
            item={props.item}
            responseItem={props.responseItem}
            index={index()}
          />
        )}
      </For>
      <button
        type="button"
        class="btn btn-link pl-0"
        onClick={() => props.formState.onAddAnswer(props.context, props.item)}
      >
        {`Add Answer: ${props.item.text}`}
      </button>
    </>
  );
}
