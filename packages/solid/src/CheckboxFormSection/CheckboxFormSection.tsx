// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX, ParentProps } from 'solid-js';

export interface CheckboxFormSectionProps extends ParentProps {
  /** For attribute for the associated checkbox */
  readonly htmlFor?: string;
  /** Section title/label */
  readonly title?: string;
  /** Description text */
  readonly description?: string;
  /** Whether to show required asterisk */
  readonly withAsterisk?: boolean;
  /** Test ID */
  readonly testId?: string;
  /** FHIR path for debug mode */
  readonly fhirPath?: string;
  /** Whether this section is read-only */
  readonly readonly?: boolean;
}

/**
 * CheckboxFormSection wraps a checkbox with a label and description.
 * The checkbox comes before the label, horizontal layout.
 * @param props
 */
export function CheckboxFormSection(props: CheckboxFormSectionProps): JSX.Element {
  const labelClass = (): string => {
    return props.readonly ? 'label-text text-base-content/60' : 'label-text';
  };

  return (
    <div class="form-control" data-testid={props.testId}>
      <label class="label cursor-pointer justify-start gap-3">
        <div>{props.children}</div>
        <div class="flex flex-col">
          <span class={labelClass()}>
            {props.title}
            {props.withAsterisk && <span class="text-error ml-1">*</span>}
          </span>
          {props.description && (
            <span class="label-text-alt text-base-content/60">{props.description}</span>
          )}
        </div>
      </label>
    </div>
  );
}
