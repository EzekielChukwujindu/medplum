// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { QuestionnaireFormPaginationState } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { Show } from 'solid-js';
import { Button } from '../Button/Button';
import { Steps } from '../Steps/Steps';

export interface QuestionnaireFormStepperProps {
  readonly formState: QuestionnaireFormPaginationState;
  readonly submitButtonText?: string;
  readonly excludeButtons?: boolean;
  readonly children?: JSX.Element;
}

export function QuestionnaireFormStepper(props: QuestionnaireFormStepperProps): JSX.Element {
  const pages = () => props.formState.pages;
  const activePage = () => props.formState.activePage;
  const showBackButton = () => activePage() > 0;
  const showNextButton = () => activePage() < pages().length - 1;
  const showSubmitButton = () => activePage() === pages().length - 1;

  return (
    <>
      <div class="px-6 py-2">
        <Steps
          current={activePage()}
          steps={pages().map(p => ({ title: p.title }))}
        />
        <div class="mt-4">
             {props.children}
        </div>
      </div>
      <Show when={!props.excludeButtons}>
        <div class="flex justify-end gap-2 mt-6">
          <Show when={showBackButton()}>
            <Button onClick={props.formState.onPrevPage} variant="secondary">Back</Button>
          </Show>
          <Show when={showNextButton()}>
            <Button
              onClick={(e) => {
                // In Solid, references are usually passed or handled differently.
                // But triggering html5 validation requires finding the form.
                const btn = e.currentTarget as HTMLButtonElement;
                const form = btn.closest('form');
                if (form?.reportValidity()) {
                   props.formState.onNextPage();
                }
              }}
            >
              Next
            </Button>
          </Show>
          <Show when={showSubmitButton()}>
            <Button type="submit">{props.submitButtonText ?? 'Submit'}</Button>
          </Show>
        </div>
      </Show>
    </>
  );
}
