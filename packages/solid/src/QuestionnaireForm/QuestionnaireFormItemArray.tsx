// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireItem, QuestionnaireResponseItem } from '@medplum/fhirtypes';
import { QuestionnaireItemType, isQuestionEnabled  } from '@medplum/solid-hooks';
import type {QuestionnaireFormLoadedState} from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { For } from 'solid-js';
import { FormSection } from '../FormSection/FormSection';
import { QuestionnaireFormGroup } from './QuestionnaireFormGroup';
import { QuestionnaireFormItem } from './QuestionnaireFormItem';
import { QuestionnaireFormRepeatableGroup } from './QuestionnaireFormRepeatableGroup';
import { QuestionnaireFormRepeatableItem } from './QuestionnaireFormRepeatableItem';

export interface QuestionnaireFormItemArrayProps {
  readonly formState: QuestionnaireFormLoadedState;
  readonly context: QuestionnaireResponseItem[];
  readonly items: QuestionnaireItem[];
  readonly responseItems: QuestionnaireResponseItem[];
}

export function QuestionnaireFormItemArray(props: QuestionnaireFormItemArrayProps): JSX.Element {
  return (
    <div class="flex flex-col gap-4">
      <For each={props.items}>
        {(item, index) => {
          // Check if question is enabled
          // Note: isQuestionEnabled might need to be reactive if it depends on formState.questionnaireResponse
          // In Solid, if formState.questionnaireResponse is a signal/store, accessing it inside the tracking scope (this function)
          // might not be enough if isQuestionEnabled is not designed for reactivity.
          // But passing the tracked value to isQuestionEnabled checks the value.
          // Since For is keyed by item, the body re-executes if item changes? No, For renders once per item.
          // We need dynamic check.
          // We can use a derived signal inside the loop?
          // Or usage of Show?

          const isEnabled = () => isQuestionEnabled(item, props.formState.questionnaireResponse);
          
          // Filter response items for this item
          const filteredResponseItems = () => props.responseItems.filter((r) => r.linkId === item.linkId);
          
          return (
             // @ts-ignore - Show/For specific TS issues with dynamic checking if needed, but mostly fine
            <div style={{ display: isEnabled() ? 'block' : 'none' }}>
                {(() => {
                    const type = item.type;
                    
                    if (type === QuestionnaireItemType.display) {
                         return <p class="mb-4">{item.text}</p>;
                    }
                    
                    if (type === QuestionnaireItemType.group) {
                         if (item.repeats) {
                             return <QuestionnaireFormRepeatableGroup
                                      formState={props.formState}
                                      context={props.context}
                                      item={item}
                                      responseItems={filteredResponseItems()}
                                    />;
                         } else {
                             const respItem = () => filteredResponseItems()[0];
                             // If no response item exists yet (should be created by hook logic?), handle safely
                             return respItem() ? (
                                <QuestionnaireFormGroup
                                  formState={props.formState}
                                  context={props.context}
                                  item={item}
                                  responseItem={respItem()!}
                                />
                             ) : null;
                         }
                    }
                    
                    if (type === QuestionnaireItemType.boolean) {
                        // Boolean items don't have a section title to avoid duplication
                        return <QuestionnaireFormItem
                                  formState={props.formState}
                                  context={props.context}
                                  item={item}
                                  responseItem={filteredResponseItems()[0]}
                                  index={0}
                               />;
                    }
                    
                    if (item.repeats) {
                        return <QuestionnaireFormRepeatableItem
                                  formState={props.formState}
                                  context={props.context}
                                  item={item}
                                  responseItem={filteredResponseItems()[0]}
                                />;
                    }
                    
                    // Default case
                    return (
                        <FormSection
                          htmlFor={item.linkId}
                          title={item.text}
                          withAsterisk={item.required}
                        >
                           <QuestionnaireFormItem
                              formState={props.formState}
                              context={props.context}
                              item={item}
                              responseItem={filteredResponseItems()[0]}
                              index={0}
                           />
                        </FormSection>
                    );
                })()}
            </div>
          );
        }}
      </For>
    </div>
  );
}
