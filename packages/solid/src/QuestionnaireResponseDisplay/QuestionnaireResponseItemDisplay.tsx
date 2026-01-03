// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { formatDate } from '@medplum/core';
import type { QuestionnaireResponseItem, QuestionnaireResponseItemAnswer } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { For, Show } from 'solid-js';
import { CodeableConceptDisplay } from '../CodeableConceptDisplay/CodeableConceptDisplay';
import { QuantityDisplay } from '../QuantityDisplay/QuantityDisplay';
import { RangeDisplay } from '../RangeDisplay/RangeDisplay';

export interface QuestionnaireResponseItemDisplayProps {
  readonly item: QuestionnaireResponseItem;
}

/**
 * Displays a single QuestionnaireResponseItem with its answers.
 * @param props
 */
export function QuestionnaireResponseItemDisplay(props: QuestionnaireResponseItemDisplayProps): JSX.Element {
  const { text: title, answer, item: nestedAnswers } = props.item;

  const hasAnswers = () => answer && answer.length > 0;
  const hasNestedItems = () => nestedAnswers && nestedAnswers.length > 0;

  return (
    <div class="pb-2">
      <h3 
        class="text-lg font-semibold" 
        id={props.item.id ? `question-${props.item.id}` : undefined}
      >
        {title}
      </h3>
      
      <Show 
        when={hasAnswers()}
        fallback={
          <Show 
            when={hasNestedItems()} 
            fallback={<p class="text-base-content/60">No answer</p>}
          >
            <For each={nestedAnswers}>
              {(nestedAnswer, index) => (
                <QuestionnaireResponseItemDisplay item={nestedAnswer} />
              )}
            </For>
          </Show>
        }
      >
        <For each={answer}>
          {(ans, index) => <AnswerDisplay answer={ans} />}
        </For>
      </Show>
    </div>
  );
}

interface AnswerDisplayProps {
  readonly answer: QuestionnaireResponseItemAnswer;
}

function AnswerDisplay(props: AnswerDisplayProps): JSX.Element {
  const { answer } = props;
  
  if (!answer) {
    return <p class="text-base-content/60">Invalid answer</p>;
  }

  const validEntries = Object.entries(answer).filter(
    ([, value]) => value !== undefined && value !== null
  );

  if (validEntries.length === 0) {
    return <p class="text-base-content/60">No valid answer data</p>;
  }

  const [key, value] = validEntries[0];

  switch (key) {
    case 'valueInteger':
      return <p>{value}</p>;
    case 'valueQuantity':
      return <QuantityDisplay value={value} />;
    case 'valueString':
      return <p>{value}</p>;
    case 'valueCoding':
      return <CodeableConceptDisplay value={{ coding: [value] }} />;
    case 'valueRange':
      return <RangeDisplay value={value} />;
    case 'valueDateTime':
      return <p>{formatDate(value)}</p>;
    case 'valueBoolean':
      return <p>{value ? 'True' : 'False'}</p>;
    case 'valueReference':
      return <p>{(value as { display?: string; reference?: string }).display ?? (value as { reference?: string }).reference}</p>;
    default:
      return <p>{String(value)}</p>;
  }
}
