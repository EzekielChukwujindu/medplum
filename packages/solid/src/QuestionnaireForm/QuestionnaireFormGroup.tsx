// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import type { QuestionnaireFormLoadedState } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { QuestionnaireFormItemArray } from './QuestionnaireFormItemArray';

export interface QuestionnaireFormGroupProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly item: QuestionnaireItem;
  readonly responseItem: QuestionnaireResponseItem;
}

export function QuestionnaireFormGroup(props: QuestionnaireFormGroupProps): JSX.Element {
  const newContext = () => [...props.context, props.responseItem];
  
  return (
    <div class="mb-4">
      {props.item.text && (
        <h3 class="text-lg font-semibold mb-2">{props.item.text}</h3>
      )}
      <QuestionnaireFormItemArray
        formState={props.formState}
        context={newContext()}
        items={props.item.item ?? []}
        responseItems={props.responseItem.item ?? []}
      />
    </div>
  );
}
