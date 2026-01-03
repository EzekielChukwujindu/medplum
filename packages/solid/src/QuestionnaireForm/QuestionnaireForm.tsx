// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { createReference, getExtension, getReferenceString } from '@medplum/core';
import type { Encounter, Questionnaire, QuestionnaireResponse, Reference } from '@medplum/fhirtypes';
import {
    QUESTIONNAIRE_SIGNATURE_REQUIRED_URL,
    QUESTIONNAIRE_SIGNATURE_RESPONSE_URL,
    useMedplum, 
    useQuestionnaireForm
    
    
} from '@medplum/solid-hooks';
import type {QuestionnaireFormState, QuestionnaireFormLoadingState} from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { Show, createSignal, createMemo } from 'solid-js';
import { Button } from '../Button/Button';
import { SignatureInput } from '../SignatureInput/SignatureInput';
import { QuestionnaireFormItemArray } from './QuestionnaireFormItemArray';
import { QuestionnaireFormStepper } from './QuestionnaireFormStepper';

export interface QuestionnaireFormProps {
  readonly questionnaire: Questionnaire | Reference<Questionnaire>;
  readonly questionnaireResponse?: QuestionnaireResponse | Reference<QuestionnaireResponse>;
  readonly subject?: Reference;
  readonly encounter?: Reference<Encounter>;
  readonly source?: QuestionnaireResponse['source'];
  readonly disablePagination?: boolean;
  readonly excludeButtons?: boolean;
  readonly submitButtonText?: string;
  readonly onChange?: (response: QuestionnaireResponse) => void;
  readonly onSubmit?: (response: QuestionnaireResponse) => void;
}

export function QuestionnaireForm(props: QuestionnaireFormProps): JSX.Element | null {
  const medplum = useMedplum();
  const [signatureRequiredSubmitted, setSignatureRequiredSubmitted] = createSignal(false);
  
  // onFormChange is just props.onChange wrapper
  const onFormChange = (response: QuestionnaireResponse) => {
      setSignatureRequiredSubmitted(false);
      props.onChange?.(response);
  };

  const formState = useQuestionnaireForm({
    questionnaire: props.questionnaire,
    defaultValue: props.questionnaireResponse,
    subject: props.subject,
    encounter: props.encounter,
    source: props.source,
    disablePagination: props.disablePagination,
    onChange: onFormChange,
  });

  const isSignatureRequired = createMemo(() => {
    if (formState.loading) {return false;}
    return !!getExtension(formState.questionnaire, QUESTIONNAIRE_SIGNATURE_REQUIRED_URL);
  });

  const hasSignature = createMemo(() => {
    if (formState.loading) {return false;}
    return !!formState.questionnaireResponse.extension?.find((ext) => ext.url === QUESTIONNAIRE_SIGNATURE_RESPONSE_URL);
  });

  const handleSubmit = (e: Event) => {
      e.preventDefault();
      if (formState.loading) {return;}
      
      const onSubmit = props.onSubmit;
      if (!onSubmit) {return;}

      if (isSignatureRequired() && !hasSignature()) {
        setSignatureRequiredSubmitted(true);
        return;
      }
      
      const questionnaire = formState.questionnaire;
      const response = formState.questionnaireResponse;
      const subject = props.subject;
      let source = props.source;
      if (!source) {
          const profile = medplum.getProfile();
          if (profile) {
              source = createReference(profile);
          }
      }

      onSubmit({
          ...response,
          questionnaire: questionnaire.url ?? getReferenceString(questionnaire),
          subject,
          source,
          authored: new Date().toISOString(),
          status: 'completed'
      });
  };

  const loadedState = () => formState as Exclude<QuestionnaireFormState, QuestionnaireFormLoadingState>;

  return (
    <Show when={!formState.loading}>
        <form onSubmit={handleSubmit} data-testid="questionnaire-form">
          <Show when={loadedState().questionnaire.title}>
             <h1 class="text-2xl font-bold mb-4">{loadedState().questionnaire.title}</h1>
          </Show>
          
          <Show when={loadedState().pagination} fallback={
              <>
                 <QuestionnaireFormItemArray
                    formState={loadedState()}
                    context={[]}
                    items={loadedState().items}
                    responseItems={loadedState().responseItems}
                 />
                 <Show when={isSignatureRequired()}>
                    <div class="mt-4">
                       <p class="text-sm font-medium mb-1">Signature</p>
                       <SignatureInput onChange={loadedState().onChangeSignature} />
                       <Show when={!hasSignature() && signatureRequiredSubmitted()}>
                          <p class="text-error text-sm mt-1">Signature is required.</p>
                       </Show>
                    </div>
                 </Show>
                 <Show when={!props.excludeButtons}>
                    <div class="flex justify-end mt-6">
                        <Button type="submit">{props.submitButtonText ?? 'Submit'}</Button>
                    </div>
                 </Show>
              </>
          }>
               {/* QuestionnaireFormStepper case */}
               {(() => {
                  const paginationState = loadedState() as any; 
                  return (
                      <QuestionnaireFormStepper
                        formState={paginationState}
                        submitButtonText={props.submitButtonText}
                        excludeButtons={props.excludeButtons}
                      >
                         <QuestionnaireFormItemArray
                            formState={loadedState()}
                            context={[]}
                            items={loadedState().items}
                            responseItems={loadedState().responseItems}
                         />
                      </QuestionnaireFormStepper>
                  );
               })()}
          </Show>
        </form>
    </Show>
  );
}
