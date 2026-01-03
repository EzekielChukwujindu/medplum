// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { For, Show } from 'solid-js';
import { useMedplum } from '@medplum/solid-hooks';
import { Form } from '../Form/Form';
import { Logo } from '../Logo/Logo';

export interface ChooseScopeFormProps {
  readonly login: string;
  readonly scope?: string;
  readonly handleAuthResponse: (response: any) => void;
}

const openConditionScope = /^patient\/Condition\.(?:\*|c?r?u?d?s?)$/;
const encounterDiagnosis = '?category=http://terminology.hl7.org/CodeSystem/condition-category|encounter-diagnosis';
const problemListItem = '?category=http://terminology.hl7.org/CodeSystem/condition-category|problem-list-item';
const healthConcern = '?category=http://hl7.org/fhir/us/core/CodeSystem/condition-category|health-concern';

const openObservationScope = /^patient\/Observation\.(?:\*|c?r?u?d?s?)$/;
const clinicalTest = '?category=http://hl7.org/fhir/us/core/CodeSystem/us-core-observation-category|clinical-test';
const laboratory = '?category=http://terminology.hl7.org/CodeSystem/observation-category|laboratory';
const socialHistory = '?category=http://terminology.hl7.org/CodeSystem/observation-category|social-history';
const sdoh = '?category=http://hl7.org/fhir/us/core/CodeSystem/us-core-category|sdoh';
const survey = '?category=http://terminology.hl7.org/CodeSystem/observation-category|survey';
const vitalSigns = '?category=http://terminology.hl7.org/CodeSystem/observation-category|vital-signs';

export function ChooseScopeForm(props: ChooseScopeFormProps) {
  const medplum = useMedplum();

  return (
    <Form
      onSubmit={(formData: Record<string, string>) => {
        medplum
          .post('auth/scope', {
            login: props.login,
            scope: Object.keys(formData).join(' '),
          })
          .then(props.handleAuthResponse)
          .catch(console.log);
      }}
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col items-center justify-center">
          <Logo size={32} />
          <h3 class="text-lg font-medium py-4">Choose scope</h3>
        </div>
        
        <div class="flex flex-col gap-2">
          <For each={(props.scope ?? 'openid').split(' ')}>
            {(scopeName) => {
              let additionalScopes: string[] | undefined;
              if (openConditionScope.test(scopeName)) {
                additionalScopes = [
                  scopeName + encounterDiagnosis,
                  scopeName + problemListItem,
                  scopeName + healthConcern,
                ];
              } else if (openObservationScope.test(scopeName)) {
                additionalScopes = [
                  scopeName + clinicalTest,
                  scopeName + laboratory,
                  scopeName + socialHistory,
                  scopeName + sdoh,
                  scopeName + survey,
                  scopeName + vitalSigns,
                ];
              }
              return (
                <div class="form-control">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input type="checkbox" name={scopeName} class="checkbox checkbox-sm" checked />
                    <span class="label-text">{scopeName}</span>
                  </label>
                  <Show when={additionalScopes}>
                    <div class="pl-6 flex flex-col gap-2">
                      <For each={additionalScopes}>
                        {(scope) => (
                          <label class="label cursor-pointer justify-start gap-2">
                             <input type="checkbox" name={scope} class="checkbox checkbox-sm" />
                             <span class="label-text">{scope}</span>
                          </label>
                        )}
                      </For>
                    </div>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>

        <div class="flex justify-end mt-4">
           <button type="submit" class="btn btn-primary w-full">Set Scope</button>
        </div>
      </div>
    </Form>
  );
}
