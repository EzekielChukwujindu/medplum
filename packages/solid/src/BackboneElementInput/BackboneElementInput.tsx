// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ElementsContextType } from '@medplum/core';
import { buildElementsContext, tryGetDataType } from '@medplum/core';
import type { AccessPolicyResource, OperationOutcome } from '@medplum/fhirtypes';
import type { JSX } from 'solid-js';
import { createMemo, Show } from 'solid-js';
import { ElementsContext, useElementsContext } from '../ElementsContext/ElementsContext';
import { ElementsInput } from '../ElementsInput/ElementsInput';

export interface BackboneElementInputProps {
  /** Type name the backbone element represents */
  readonly typeName: string;
  /** Schema path */
  readonly path: string;
  /** Value path for error matching */
  readonly valuePath?: string;
  /** Default value object */
  readonly defaultValue?: Record<string, unknown>;
  /** Callback when value changes */
  readonly onChange?: (value: Record<string, unknown>) => void;
  /** Profile URL of the structure definition */
  readonly profileUrl?: string;
  /** Access policy resource for field restrictions */
  readonly accessPolicyResource?: AccessPolicyResource;
  /** Operation outcome for validation errors */
  readonly outcome?: OperationOutcome;
  /** Test ID */
  readonly testId?: string;
}

/**
 * BackboneElementInput renders input fields for a FHIR BackboneElement type.
 * Creates a nested ElementsContext for the backbone element's schema.
 * @param props
 */
export function BackboneElementInput(props: BackboneElementInputProps): JSX.Element {
  const parentElementsContext = useElementsContext();
  
  const profileUrl = () => props.profileUrl ?? parentElementsContext?.profileUrl;
  
  const typeSchema = createMemo(() => 
    tryGetDataType(props.typeName, profileUrl())
  );
  
  const type = () => typeSchema()?.type ?? props.typeName;

  const contextValue = createMemo((): ElementsContextType | undefined => {
    const schema = typeSchema();
    if (!schema) {
      return undefined;
    }
    return buildElementsContext({
      parentContext: parentElementsContext,
      elements: schema.elements,
      path: props.path,
      profileUrl: schema.url,
      accessPolicyResource: props.accessPolicyResource,
    });
  });

  const isNested = () => parentElementsContext.path !== '';

  return (
    <Show
      when={typeSchema()}
      fallback={<div>{type()}&nbsp;not implemented</div>}
    >
      <ElementsContext.Provider value={contextValue()!}>
        <div 
          class={isNested() ? 'pl-4 border-l-2 border-base-300' : ''}
          data-testid={props.testId}
        >
          <ElementsInput
            path={props.path}
            valuePath={props.valuePath}
            type={type()}
            defaultValue={props.defaultValue ?? {}}
            onChange={props.onChange}
            outcome={props.outcome}
          />
        </div>
      </ElementsContext.Provider>
    </Show>
  );
}
