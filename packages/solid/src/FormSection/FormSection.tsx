// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { OperationOutcome } from '@medplum/fhirtypes';
import { getErrorsForInput } from '../utils/outcomes';
import type { JSX, ParentProps } from 'solid-js';

export interface FormSectionProps extends ParentProps {
  /** Section title/label */
  title?: string;
  /** ID of the associated input element */
  htmlFor?: string;
  /** Description text below the title */
  description?: string;
  /** Whether to show a required asterisk */
  withAsterisk?: boolean;
  /** Operation outcome for displaying errors */
  outcome?: OperationOutcome;
  /** Test ID */
  testId?: string;
  /** FHIR path for debug mode */
  fhirPath?: string;
  /** Error expression for extracting errors from outcome */
  errorExpression?: string;
  /** Whether this section is read-only */
  readonly?: boolean;
}

/**
 * FormSection wraps form inputs with a label, description, and error display.
 * Provides consistent styling for form fields.
 * @param props
 */
export function FormSection(props: FormSectionProps): JSX.Element {
  const errors = (): string | undefined => {
    if (props.outcome) {
      return getErrorsForInput(props.outcome, props.errorExpression ?? props.htmlFor);
    }
    return undefined;
  };

  const labelClass = (): string => {
    return props.readonly ? 'label-text text-base-content/60' : 'label-text';
  };

  return (
    <div class="form-control w-full" data-testid={props.testId}>
      {props.title && (
        <label class="label" for={props.htmlFor}>
          <span class={labelClass()}>
            {props.title}
            {props.withAsterisk && <span class="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      
      {props.description && (
        <p class="text-sm text-base-content/60 mb-2">{props.description}</p>
      )}
      
      {props.children}
      
      {errors() && (
        <label class="label">
          <span class="label-text-alt text-error">{errors()}</span>
        </label>
      )}
    </div>
  );
}
