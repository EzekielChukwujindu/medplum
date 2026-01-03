// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import { isPopulated, isProfileLoaded } from '@medplum/core';
import type { ElementDefinitionType, Extension, OperationOutcome } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { BackboneElementInput } from '../BackboneElementInput/BackboneElementInput';

export interface ExtensionInputProps {
  /** Input name */
  readonly name?: string;
  /** Schema path */
  readonly path: string;
  /** Property type with profile URL */
  readonly propertyType: ElementDefinitionType;
  /** Default extension value */
  readonly defaultValue?: Extension;
  /** Callback when extension changes */
  readonly onChange?: (value: Extension | undefined) => void;
  /** Whether input is disabled */
  readonly disabled?: boolean;
  /** Operation outcome for validation errors */
  readonly outcome?: OperationOutcome;
  /** Test ID */
  readonly testId?: string;
}

/**
 * ExtensionInput allows editing FHIR Extension values.
 * Loads extension profile if needed.
 * @param props
 */
export function ExtensionInput(props: ExtensionInputProps): JSX.Element {
  const medplum = useMedplum();
  const [loadingProfile, setLoadingProfile] = createSignal(false);

  const profileUrl = createMemo(() => {
    if (!isPopulated(props.propertyType.profile)) {
      return undefined;
    }
    return props.propertyType.profile![0];
  });

  createEffect(() => {
    const url = profileUrl();
    if (url) {
      setLoadingProfile(true);
      medplum
        .requestProfileSchema(url)
        .then(() => setLoadingProfile(false))
        .catch((reason) => {
          setLoadingProfile(false);
          console.warn(reason);
        });
    }
  });

  const isLoading = () => {
    const url = profileUrl();
    return url && (loadingProfile() || !isProfileLoaded(url));
  };

  /*
    From the spec:
    An extension SHALL have either a value (i.e. a value[x] element) or sub-extensions, but not both.
    If present, the value[x] element SHALL have content (value attribute or other elements)
  */

  return (
    <Show when={!isLoading()} fallback={<div>Loading...</div>}>
      <BackboneElementInput
        profileUrl={profileUrl()}
        path={props.path}
        typeName="Extension"
        defaultValue={props.defaultValue as unknown as Record<string, unknown>}
        onChange={(value) => props.onChange?.(value as unknown as Extension)}
        outcome={props.outcome}
        testId={props.testId}
      />
    </Show>
  );
}
