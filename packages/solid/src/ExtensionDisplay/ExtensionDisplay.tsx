// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { ElementType, InternalTypeSchema } from '@medplum/core';
import { getDataType, isPopulated, isProfileLoaded, tryGetProfile } from '@medplum/core';
import type { Extension } from '@medplum/fhirtypes';
import { useMedplum } from '@medplum/solid-hooks';
import type { JSX } from 'solid-js';
import { createEffect, createMemo, createSignal, Show } from 'solid-js';
import { BackboneElementDisplay } from '../BackboneElementDisplay/BackboneElementDisplay';
import { ResourcePropertyDisplay } from '../ResourcePropertyDisplay/ResourcePropertyDisplay';

export interface ExtensionDisplayProps {
  /** Schema path for the extension */
  readonly path: string;
  /** Element definition type with profile URL */
  readonly elementDefinitionType?: ElementType;
  /** Extension value */
  readonly value: Extension;
  /** Whether to hide missing values */
  readonly ignoreMissingValues?: boolean;
  /** Whether to render as links */
  readonly link?: boolean;
  /** Compact display mode */
  readonly compact?: boolean;
}

/**
 * ExtensionDisplay renders a FHIR Extension value.
 * Loads extension profile if needed.
 * @param props
 */
export function ExtensionDisplay(props: ExtensionDisplayProps): JSX.Element {
  const medplum = useMedplum();
  const [typeSchema, setTypeSchema] = createSignal<InternalTypeSchema>(getDataType('Extension'));
  const [loadingProfile, setLoadingProfile] = createSignal(false);

  const profileUrl = createMemo(() => {
    if (!isPopulated(props.elementDefinitionType?.profile)) {
      return undefined;
    }
    return props.elementDefinitionType!.profile![0];
  });

  createEffect(() => {
    const url = profileUrl();
    if (url) {
      setLoadingProfile(true);
      medplum
        .requestProfileSchema(url)
        .then(() => {
          const profile = tryGetProfile(url);
          setLoadingProfile(false);
          if (profile) {
            setTypeSchema(profile);
          }
        })
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

  const valueElement = () => typeSchema().elements['value[x]'];
  const extensionHasValue = () => valueElement()?.max !== 0;

  const getValueAndType = (): [unknown, string | undefined] => {
    const extension = props.value;
    // Find the value[x] property
    for (const key of Object.keys(extension)) {
      if (key.startsWith('value')) {
        return [(extension as unknown as Record<string, unknown>)[key], key.replace('value', '')];
      }
    }
    return [undefined, undefined];
  };

  return (
    <Show when={!isLoading()} fallback={<div>Loading...</div>}>
      <Show
        when={extensionHasValue()}
        fallback={
          <BackboneElementDisplay
            path={props.path}
            value={{ type: typeSchema().type as string, value: props.value }}
            compact={props.compact}
            ignoreMissingValues={props.ignoreMissingValues}
            link={props.link}
            profileUrl={profileUrl()}
          />
        }
      >
        {(() => {
          const [propertyValue, propertyType] = getValueAndType();
          return propertyType ? <ResourcePropertyDisplay propertyType={propertyType} value={propertyValue} /> : null;
        })()}
      </Show>
    </Show>
  );
}
